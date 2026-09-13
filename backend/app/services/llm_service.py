import json
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("llm_service")


class LLMService:
    @staticmethod
    def _call_mistral(prompt: str, system_prompt: str = "You are ResolveAI, an autonomous enterprise customer resolution decision engine. Output concise, factual responses.") -> Optional[str]:
        api_key = settings.MISTRAL_API_KEY
        if not api_key:
            return None

        try:
            from mistralai.client import Mistral
            client = Mistral(api_key=api_key)
            response = client.chat.complete(
                model="mistral-small-latest",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.1
            )
            if response and response.choices and len(response.choices) > 0:
                return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Mistral API call failed or rate-limited ({e}). Gracefully utilizing deterministic resolution fallback.")
            return None

    @classmethod
    def understand_customer_intent(cls, title: str, description: str) -> Dict[str, Any]:
        """
        Uses Mistral LLM to parse customer intent, goal, and extracted entity signals.
        Falls back seamlessly to deterministic rule-based extraction if rate-limited or offline.
        """
        prompt = (
            f"Analyze this customer issue:\nTitle: {title}\nDescription: {description}\n"
            f"Identify: (1) Primary goal, (2) Problem category (damaged, cancellation, return_refund, inquiry).\n"
            f"Respond in 1 short sentence describing the intent."
        )

        llm_response = cls._call_mistral(prompt)

        # Base deterministic extraction for guaranteed system stability
        desc_lower = description.lower()
        title_lower = title.lower()

        if "damaged" in desc_lower or "broken" in desc_lower or "cracked" in desc_lower or "damaged" in title_lower:
            fallback_goal = "Customer requested replacement or verified refund for damaged item."
            category = "damaged"
        elif "cancel" in desc_lower or "cancel" in title_lower:
            fallback_goal = "Customer requested order cancellation prior to warehouse fulfillment."
            category = "cancellation"
        elif "return" in desc_lower or "refund" in desc_lower:
            fallback_goal = "Customer requested return authorization and transaction refund."
            category = "return_refund"
        else:
            fallback_goal = "Customer requested general support resolution."
            category = "general"

        return {
            "goal": llm_response if llm_response else fallback_goal,
            "category": category,
            "llm_powered": bool(llm_response),
            "model": "mistral-small-latest" if llm_response else "deterministic-rules"
        }

    @classmethod
    def explain_plan_decision(cls, plan_type: str, reason: str, context: Dict[str, Any]) -> str:
        """
        Produces concise, user-safe decision explanations.
        """
        prompt = (
            f"Explain to a customer why action '{plan_type}' was chosen based on reason: '{reason}' "
            f"and context: {context}. Keep it under 2 sentences, professional and reassuring."
        )
        explanation = cls._call_mistral(prompt)
        if explanation:
            return explanation
        return f"Resolution chosen ({plan_type}): {reason}"

    @classmethod
    def explain_adaptation(cls, previous_action: str, reason: str, adapted_action: str) -> str:
        """
        Produces concise explanation of an autonomous replanning event.
        """
        prompt = (
            f"Explain why ResolveAI adapted from {previous_action} to {adapted_action} due to: {reason}. "
            f"Keep it under 2 sentences."
        )
        explanation = cls._call_mistral(prompt)
        if explanation:
            return explanation
        return f"Autonomously adapted from {previous_action} to {adapted_action}: {reason}"
