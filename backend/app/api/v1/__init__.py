from fastapi import APIRouter
from app.api.v1.customers import router as customers_router
from app.api.v1.orders import router as orders_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.policies import router as policies_router
from app.api.v1.actions import router as actions_router
from app.api.v1.verification import router as verification_router
from app.api.v1.cases import router as cases_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.escalations import router as escalations_router

api_v1_router = APIRouter()
api_v1_router.include_router(customers_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(policies_router)
api_v1_router.include_router(actions_router)
api_v1_router.include_router(verification_router)
api_v1_router.include_router(cases_router)
api_v1_router.include_router(approvals_router)
api_v1_router.include_router(escalations_router)
