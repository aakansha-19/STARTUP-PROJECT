import json
import os
import re
from typing import Dict, Any, List, Tuple


class ReadinessEngine:
    def __init__(self, roles_path: str = None):
        if not roles_path:
            roles_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "data",
                "roles.json"
            )
        self.roles_path = roles_path
        self.roles_by_id = self._load_roles()

    def _load_roles(self) -> Dict[str, Dict[str, Any]]:
        if os.path.exists(self.roles_path):
            with open(self.roles_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {role["id"]: role for role in data.get("roles", [])}
        return {}

    def get_role(self, role_id: str) -> Dict[str, Any]:
        return self.roles_by_id.get(role_id)

    def get_all_roles(self) -> List[Dict[str, Any]]:
        return list(self.roles_by_id.values())

    def analyze_skill_gap(self, extracted_skills: List[str], role_id: str) -> Dict[str, Any]:
        """
        Compares extracted candidate skills against role requirements.
        Calculates weighted match percentage and sorts missing skills by importance.
        """
        role = self.get_role(role_id)
        if not role:
            raise ValueError(f"Job role '{role_id}' not found.")

        required_skills = role.get("required_skills", [])
        preferred_skills = role.get("preferred_skills", [])
        weights = role.get("skill_weights", {})

        candidate_skills_set = set(extracted_skills)
        matched_required = [s for s in required_skills if s in candidate_skills_set]
        matched_preferred = [s for s in preferred_skills if s in candidate_skills_set]
        all_matched = sorted(list(set(matched_required + matched_preferred)))

        missing_required = [s for s in required_skills if s not in candidate_skills_set]
        missing_preferred = [s for s in preferred_skills if s not in candidate_skills_set]

        # Calculate weighted skill match percentage
        total_possible_weight = sum(weights.get(s, 1.0) for s in required_skills) + sum(weights.get(s, 0.5) for s in preferred_skills)
        earned_weight = sum(weights.get(s, 1.0) for s in matched_required) + sum(weights.get(s, 0.5) for s in matched_preferred)

        if total_possible_weight > 0:
            skill_match_percentage = min(100.0, max(0.0, (earned_weight / total_possible_weight) * 100.0))
        else:
            skill_match_percentage = 0.0

        # Structured missing skills list sorted by priority (Required first by descending weight, then Preferred)
        structured_missing = []
        priority_counter = 1

        # Sort missing required skills by weight descending
        sorted_missing_req = sorted(missing_required, key=lambda s: weights.get(s, 1.0), reverse=True)
        for s in sorted_missing_req:
            structured_missing.append({
                "skill": s,
                "importance": "Required",
                "weight": weights.get(s, 1.0),
                "learning_priority": priority_counter
            })
            priority_counter += 1

        # Sort missing preferred skills by weight descending
        sorted_missing_pref = sorted(missing_preferred, key=lambda s: weights.get(s, 0.5), reverse=True)
        for s in sorted_missing_pref:
            structured_missing.append({
                "skill": s,
                "importance": "Preferred",
                "weight": weights.get(s, 0.5),
                "learning_priority": priority_counter
            })
            priority_counter += 1

        return {
            "role_id": role_id,
            "role_title": role.get("title"),
            "skill_match_percentage": round(skill_match_percentage, 1),
            "matched_skills": all_matched,
            "matched_required": matched_required,
            "matched_preferred": matched_preferred,
            "missing_skills": structured_missing,
            "missing_required_count": len(missing_required),
            "missing_preferred_count": len(missing_preferred)
        }

    def calculate_readiness_score(
        self,
        skill_match_percentage: float,
        project_count: int,
        internship_count: int,
        cgpa: float = None,
        extracted_skills: List[str] = None
    ) -> Tuple[float, str, Dict[str, Any]]:
        """
        Calculates transparent heuristic placement readiness score out of 100.
        
        Formula and Weight Distribution:
        1. Skill Match Contribution (50% max):
           - (skill_match_percentage / 100.0) * 50 points
        2. Relevant Projects Contribution (20% max):
           - 0 projects = 0 pts
           - 1 project  = 8 pts
           - 2 projects = 15 pts
           - 3+ projects = 20 pts
        3. Internship & Work Experience Contribution (15% max):
           - 0 internships = 0 pts
           - 1 internship  = 10 pts
           - 2+ internships = 15 pts
        4. Academic Standing / CGPA Contribution (15% max):
           - Normalized CGPA (0-10 scale) * 1.5 points
           - Default benchmark of 7.0 applied with notice if omitted (10.5 pts)
        
        Total Score = Sum of above 4 components (0 to 100).
        """
        # 1. Skill Match Component
        skill_score = (max(0.0, min(100.0, skill_match_percentage)) / 100.0) * 50.0

        # 2. Projects Component
        if project_count >= 3:
            projects_score = 20.0
        elif project_count == 2:
            projects_score = 15.0
        elif project_count == 1:
            projects_score = 8.0
        else:
            projects_score = 0.0

        # 3. Internships Component
        if internship_count >= 2:
            internships_score = 15.0
        elif internship_count == 1:
            internships_score = 10.0
        else:
            internships_score = 0.0

        # 4. Academics Component
        if cgpa is not None and cgpa > 0:
            clamped_cgpa = max(0.0, min(10.0, float(cgpa)))
            academics_score = (clamped_cgpa / 10.0) * 15.0
            academics_note = f"Evaluated from provided CGPA {clamped_cgpa:.2f}/10"
        else:
            # Baseline neutral score (approx 7.0/10) when student hasn't entered CGPA
            academics_score = 10.5
            academics_note = "Baseline estimate (7.0/10 standard benchmark applied; enter CGPA to personalize)"

        total_score = round(min(100.0, max(0.0, skill_score + projects_score + internships_score + academics_score)), 1)

        # Categorize Readiness Level
        if total_score >= 80.0:
            readiness_level = "High Readiness"
        elif total_score >= 60.0:
            readiness_level = "Moderate Readiness"
        else:
            readiness_level = "Needs Preparation"

        breakdown = {
            "skill_match_score": round(skill_score, 1),
            "skill_match_max": 50.0,
            "projects_score": round(projects_score, 1),
            "projects_max": 20.0,
            "internships_score": round(internships_score, 1),
            "internships_max": 15.0,
            "academics_score": round(academics_score, 1),
            "academics_max": 15.0,
            "academics_note": academics_note,
            "total_score": total_score,
            "formula_explanation": (
                "Transparent Heuristic Score: 50% Skill Match + 20% Practical Projects "
                "+ 15% Internship Experience + 15% Academic Standing. "
                "Labeled as heuristic until institution-specific outcome calibration."
            )
        }

        return total_score, readiness_level, breakdown

    def generate_improvement_suggestions(
        self,
        extracted_skills: List[str],
        missing_skills: List[Dict[str, Any]],
        project_count: int,
        internship_count: int,
        cgpa: float,
        raw_text: str = ""
    ) -> List[str]:
        """
        Generates honest, actionable feedback based on candidate gaps.
        """
        suggestions = []

        # Skill gap suggestions
        req_missing = [m["skill"] for m in missing_skills if m.get("importance") == "Required"]
        if req_missing:
            top_missing = ", ".join(req_missing[:3])
            suggestions.append(f"Prioritize foundational required skills first: focus immediately on {top_missing}.")

        # Project portfolio suggestions
        if project_count < 2:
            suggestions.append("Add at least 2 end-to-end projects featuring clear architectural decisions and live deployment links.")
        elif project_count >= 2:
            suggestions.append("Ensure your project descriptions highlight measurable outcomes (e.g., latency reduction, dataset volume, or user traction).")

        # Internship suggestions
        if internship_count == 0:
            suggestions.append("Consider pursuing virtual internships, freelance contracts, or research assistantships to gain real-world collaboration experience.")

        # Text quality & metrics heuristics
        if raw_text:
            has_metrics = bool(re.search(r'\b(?:\d+%(?:\s+increase|\s+reduction)?|\$\d+|\d+x|\d+\s*(?:users|clients|records|queries))\b', raw_text, re.IGNORECASE))
            if not has_metrics:
                suggestions.append("Quantify your project achievements using metrics (e.g., 'improved query speed by 35%' or 'analyzed 50,000+ data points').")

            has_git_link = bool(re.search(r'github\.com\/[A-Za-z0-9_-]+', raw_text, re.IGNORECASE))
            if not has_git_link:
                suggestions.append("Include active GitHub repository links for every listed technical project so recruiters can inspect your code quality.")

        if len(suggestions) < 3:
            suggestions.append("Align your resume bullet points with STAR format (Situation, Task, Action, Result) to maximize interview shortlisting.")

        return suggestions
