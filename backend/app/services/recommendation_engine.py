import json
import os
from typing import List, Dict, Any, Optional


class RecommendationEngine:
    def __init__(self, catalog_path: Optional[str] = None):
        if not catalog_path:
            catalog_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "data",
                "courses_catalog.json"
            )
        self.catalog_path = catalog_path
        self.catalog = self._load_catalog()

    def _load_catalog(self) -> Dict[str, Any]:
        if os.path.exists(self.catalog_path):
            with open(self.catalog_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("recommendations", {})
        return {}

    def get_recommendations_for_missing_skills(
        self,
        missing_skills: List[Dict[str, Any]],
        role_id: str = None
    ) -> List[Dict[str, Any]]:
        """
        Maps missing skills to concrete courses, verified links, project prompts,
        and difficulty levels, preserving priority order and avoiding duplicates.
        """
        recommendations = []
        seen_skills = set()

        for item in missing_skills:
            skill_name = item.get("skill")
            if not skill_name or skill_name in seen_skills:
                continue

            seen_skills.add(skill_name)
            course_data = self.catalog.get(skill_name)

            if course_data:
                rec_entry = {
                    "skill": skill_name,
                    "importance": item.get("importance", "Required"),
                    "priority": item.get("learning_priority", len(recommendations) + 1),
                    "course_name": course_data.get("course_name"),
                    "provider": course_data.get("provider"),
                    "course_url": course_data.get("course_url"),
                    "alternate_resource": course_data.get("alternate_resource"),
                    "difficulty": course_data.get("difficulty"),
                    "estimated_weeks": course_data.get("estimated_weeks", 3),
                    "project_idea": course_data.get("project_idea"),
                    "key_topics": course_data.get("key_topics", [])
                }
            else:
                # Fallback for any unanticipated skill name with a search resource
                rec_entry = {
                    "skill": skill_name,
                    "importance": item.get("importance", "Preferred"),
                    "priority": item.get("learning_priority", len(recommendations) + 1),
                    "course_name": f"{skill_name} Comprehensive Development Guide",
                    "provider": "Official Developer Documentation",
                    "course_url": f"https://devdocs.io/#q={skill_name.lower().replace(' ', '+')}",
                    "alternate_resource": "https://www.freecodecamp.org/learn",
                    "difficulty": "Intermediate",
                    "estimated_weeks": 2,
                    "project_idea": f"Implement a practical proof-of-concept project demonstrating proficiency with {skill_name}.",
                    "key_topics": ["Core Syntax & Fundamentals", "Industry Best Practices", "Integration & Testing"]
                }

            recommendations.append(rec_entry)

        return recommendations
