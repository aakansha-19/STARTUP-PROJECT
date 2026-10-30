import json
import os
import re
from typing import List, Dict, Any, Optional, Tuple

# Try loading spacy if installed, otherwise provide clean fallback
try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        # Create empty English pipeline for tokenizer if model not installed
        nlp = spacy.blank("en")
    SPACY_AVAILABLE = True
except ImportError:
    spacy = None
    nlp = None
    SPACY_AVAILABLE = False


class SkillExtractor:
    def __init__(self, dictionary_path: Optional[str] = None):
        if not dictionary_path:
            dictionary_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "data",
                "skills_dictionary.json"
            )
        self.dictionary_path = dictionary_path
        self.skills_catalog = self._load_catalog()

    def _load_catalog(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.dictionary_path):
            with open(self.dictionary_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("skills", [])
        return []

    def extract_skills(self, text: str) -> List[str]:
        """
        Extracts matched canonical skills from the resume text using NLP normalization,
        token boundary matching, and multi-word phrase scanning.
        """
        if not text:
            return []

        text_lower = text.lower()
        extracted_skills = set()

        for skill_entry in self.skills_catalog:
            canonical_name = skill_entry["name"]
            aliases = skill_entry.get("aliases", [canonical_name.lower()])
            
            # Check canonical name and each alias
            for alias in aliases:
                alias_lower = alias.lower().strip()
                if not alias_lower:
                    continue

                # Handle special characters in aliases like c++, c#
                if alias_lower == "c++":
                    pattern = r'(?:\b|(?<=[^a-zA-Z0-9]))c\+\+(?:(?=[^a-zA-Z0-9])|\b)'
                elif alias_lower in ["c", "r"]:
                    pattern = rf'\b{re.escape(alias_lower)}\b'
                elif alias_lower == "rest apis" or alias_lower == "rest api":
                    pattern = r'\b(rest|restful)\s+(apis?|web\s+services?)\b'
                elif alias_lower == "power bi" or alias_lower == "powerbi":
                    pattern = r'\bpower\s*bi\b'
                else:
                    # Token boundary check for single/multi-word phrases
                    escaped = re.escape(alias_lower)
                    pattern = rf'\b{escaped}\b'

                if re.search(pattern, text_lower):
                    extracted_skills.add(canonical_name)
                    break

        # Sort alphabetically for consistent deterministic output
        return sorted(list(extracted_skills))

    def extract_metadata(self, text: str) -> Dict[str, Any]:
        """
        Extracts candidate profile signals: CGPA/percentage, education degrees,
        projects count, internships, certifications, and candidate name heuristic.
        Honest extraction: marks confidence as 'Detected' or 'Not Found'.
        """
        metadata: Dict[str, Any] = {
            "candidate_name": self._extract_candidate_name(text),
            "degrees_found": [],
            "cgpa_detected": None,
            "cgpa_scale": None,
            "cgpa_confidence": "Not Found",
            "projects_detected": 0,
            "internships_detected": 0,
            "certifications_detected": 0,
            "has_contact_info": bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)),
            "raw_word_count": len(text.split()),
        }

        # 1. Degree / Education detection
        degree_patterns = [
            (r'\b(b\.?tech|bachelor of technology|b\.?e\b|bachelor of engineering)\b', "B.Tech / B.E."),
            (r'\b(m\.?tech|master of technology|m\.?e\b)\b', "M.Tech / M.E."),
            (r'\b(b\.?sc|bachelor of science)\b', "B.Sc"),
            (r'\b(m\.?sc|master of science)\b', "M.Sc"),
            (r'\b(bca|bachelor of computer applications)\b', "BCA"),
            (r'\b(mca|master of computer applications)\b', "MCA"),
            (r'\b(computer science|information technology|data science|electronics)\b', "CS/IT Domain")
        ]
        found_degrees = []
        for pat, label in degree_patterns:
            if re.search(pat, text, re.IGNORECASE):
                if label not in found_degrees:
                    found_degrees.append(label)
        metadata["degrees_found"] = found_degrees

        # 2. CGPA / GPA / Percentage detection
        cgpa_val, confidence, scale = self._extract_cgpa(text)
        metadata["cgpa_detected"] = cgpa_val
        metadata["cgpa_confidence"] = confidence
        metadata["cgpa_scale"] = scale

        # 3. Project count heuristic
        metadata["projects_detected"] = self._count_section_items(
            text,
            section_headers=[r'projects?', r'academic projects?', r'personal projects?', r'key projects?']
        )

        # 4. Internship count heuristic
        metadata["internships_detected"] = self._count_section_items(
            text,
            section_headers=[r'internships?', r'work experience', r'experience', r'industrial training']
        )

        # 5. Certification count heuristic
        metadata["certifications_detected"] = self._count_section_items(
            text,
            section_headers=[r'certifications?', r'licenses & certifications', r'courses & certifications']
        )

        return metadata

    def _extract_candidate_name(self, text: str) -> str:
        """Extracts candidate name from the top lines of the resume."""
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        for line in lines[:5]:
            # Skip headers, emails, links, or section titles
            if "@" in line or "http" in line or "linkedin" in line or "github" in line:
                continue
            words = line.split()
            if 1 <= len(words) <= 4 and all(w.isalpha() for w in words):
                # Heuristic: Title Case name
                return line.title()
        return "Candidate"

    def _extract_cgpa(self, text: str) -> Tuple[Optional[float], str, Optional[str]]:
        """
        Carefully extracts CGPA or percentage with validation.
        Returns (value, confidence_status, scale).
        """
        # Case A: Explicit CGPA / GPA out of 10 or 4 (e.g., 'CGPA: 8.75/10', 'GPA 3.8 / 4.0')
        match_scale = re.search(r'\b(?:cgpa|gpa|grade point|aggregate)\s*[:=-]?\s*([0-9](?:\.[0-9]{1,3})?)\s*/\s*(10(?:\.0)?|4(?:\.0)?)\b', text, re.IGNORECASE)
        if match_scale:
            val = float(match_scale.group(1))
            scale_max = float(match_scale.group(2))
            if scale_max == 4.0:
                # Normalize 4.0 scale to 10.0 scale for uniform evaluation
                normalized = round((val / 4.0) * 10.0, 2)
                return min(normalized, 10.0), "Extracted (4.0 scale normalized)", "4.0"
            if 0.0 <= val <= 10.0:
                return val, "Extracted (10.0 scale)", "10.0"

        # Case B: Standard CGPA: 8.4 or 8.4 CGPA
        match_cgpa = re.search(r'\b(?:cgpa|gpa)\s*[:=-]?\s*([0-9]\.[0-9]{1,2})\b', text, re.IGNORECASE)
        if match_cgpa:
            val = float(match_cgpa.group(1))
            if 4.0 <= val <= 10.0:
                return val, "Extracted", "10.0"

        # Case C: Percentage (e.g., '82.5%')
        match_pct = re.search(r'\b(?:percentage|aggregate|marks|score)\s*[:=-]?\s*([5-9][0-9](?:\.[0-9]{1,2})?)\s*%', text, re.IGNORECASE)
        if match_pct:
            pct_val = float(match_pct.group(1))
            # Convert percentage (e.g. 85%) to 10-scale (8.5)
            val = round(pct_val / 10.0, 2)
            return min(val, 10.0), f"Extracted ({pct_val}% converted)", "100%"

        return None, "Not Found", None

    def _count_section_items(self, text: str, section_headers: List[str]) -> int:
        """
        Identifies a specific section and counts probable bullet points, titles, or items.
        """
        for header in section_headers:
            pattern = rf'(?i)(?:^|\n)(?:[#*=-]+\s*)?({header})\s*(?:[:=-]+)?\n([\s\S]*?)(?=(?:\n[A-Z][A-Za-z\s]{{2,25}}[:\n])|\Z)'
            match = re.search(pattern, text)
            if match:
                section_body = match.group(2).strip()
                # Count bullets or project headings
                bullets = len(re.findall(r'(?m)^\s*(?:[•\-\*\d+\.]|[A-Z][a-zA-Z\s]{2,40}\s*(?:\||–|-|\())\s+', section_body))
                # Or count non-empty lines with meaningful sentence structures
                if bullets > 0:
                    return min(bullets, 8)
                # Count paragraphs separated by double newlines
                paragraphs = [p for p in section_body.split('\n\n') if len(p.strip()) > 30]
                if paragraphs:
                    return min(len(paragraphs), 6)
                return 1

        # Fallback keyword occurrence count
        if "intern" in section_headers[0]:
            intern_matches = len(re.findall(r'\b(?:intern|internship|trainee|apprentice)\b', text, re.IGNORECASE))
            if intern_matches > 0:
                return min(max(1, intern_matches // 2), 4)

        return 0
