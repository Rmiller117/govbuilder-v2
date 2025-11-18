import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Statuses from "@/pages/Statuses.vue";
import Dashboard from "@/pages/Dashboard.vue";
import StatusDetail from "@/pages/StatusDetail.vue";
import CaseWorkflows from "@/pages/CaseWorkflows.vue";
import Accounting from "@/pages/Accounting.vue";
import InspectionTypes from "@/pages/InspectionTypes.vue";
import InspectionTypeDetail from "@/pages/InspectionTypeDetail.vue";
import InspectionWorkflowDetail from "@/pages/InspectionWorkflowDetail.vue";
import InspectionWorkflow from "@/pages/InspectionWorkflow.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/statuses", name: "Statuses", component: Statuses },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/statuses", name: "StatusesList", component: Statuses, },
  { path: "/statuses/:id", name: "StatusDetail", component: StatusDetail, },
  { path: "/case-workflows", name: "CaseWorkflows", component: CaseWorkflows },
  { path: "/accounting", name: "Accounting", component: Accounting },
  { path: "/inspection-types", name: "InspectionTypes", component: InspectionTypes },
  { path: "/inspection-types/new", name: "InspectionTypesNew", component: InspectionTypeDetail },
  { path: "/inspection-types/:id", name: "InspectionTypesNew", component: InspectionTypeDetail },
  { path: "/inspection-workflows", name: "InspectionWorkflows", component: InspectionWorkflow },
  { path: "/inspection-workflows/new", name: "InspectionWorkflowsNew", component: InspectionWorkflowDetail },
  { path: "/inspection-workflows/:id", name: "InspectionWorkflowsNew", component: InspectionWorkflowDetail },

];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
