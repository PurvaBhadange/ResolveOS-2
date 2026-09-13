from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import AgentEvent, EventType, ActionAuditLog


class AuditService:
    @staticmethod
    def log_agent_event(
        db: Session,
        case_id: int,
        event_type: str,
        title: str,
        detail_json: Dict[str, Any],
        agent_run_id: Optional[int] = None
    ) -> AgentEvent:
        event = AgentEvent(
            agent_run_id=agent_run_id,
            case_id=case_id,
            event_type=event_type,
            title=title,
            detail_json=detail_json,
            timestamp=datetime.utcnow()
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def log_action_audit(
        db: Session,
        case_id: int,
        event_name: str,
        payload_json: Dict[str, Any],
        action_id: Optional[int] = None,
        actor_type: str = "agent",
        actor_id: str = "resolveos_agent"
    ) -> ActionAuditLog:
        audit = ActionAuditLog(
            action_id=action_id,
            case_id=case_id,
            actor_type=actor_type,
            actor_id=actor_id,
            event_name=event_name,
            payload_json=payload_json,
            timestamp=datetime.utcnow()
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit
