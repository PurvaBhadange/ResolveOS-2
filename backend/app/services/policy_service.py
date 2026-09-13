from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from app.models import Policy, PolicyVersion, PolicyChunk


class PolicyService:
    @staticmethod
    def get_active_policy(db: Session, code: str) -> Optional[PolicyVersion]:
        policy = db.query(Policy).filter(Policy.code == code).first()
        if not policy:
            return None
        return db.query(PolicyVersion).filter(
            PolicyVersion.policy_id == policy.id,
            PolicyVersion.is_active == True
        ).first()

    @staticmethod
    def search_policy_chunks(db: Session, query: str, top_k: int = 3) -> List[Dict]:
        """Simple text relevance search for policy chunks (compatible with all DBs)."""
        chunks = db.query(PolicyChunk, PolicyVersion, Policy)\
            .join(PolicyVersion, PolicyChunk.policy_version_id == PolicyVersion.id)\
            .join(Policy, PolicyVersion.policy_id == Policy.id)\
            .filter(PolicyVersion.is_active == True).all()

        query_terms = set(query.lower().split())
        results = []

        for chunk, version, policy in chunks:
            text = chunk.content.lower()
            match_score = sum(1 for term in query_terms if term in text) / max(len(query_terms), 1)
            results.append({
                "policy_code": policy.code,
                "policy_name": policy.name,
                "version_number": version.version_number,
                "effective_date": version.effective_date,
                "return_window_days": version.return_window_days,
                "score": round(match_score, 2),
                "matched_chunk": chunk.content
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
