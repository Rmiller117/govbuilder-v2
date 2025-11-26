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
import LicenseStatuses from "@/pages/LicenseStatuses.vue";
import LicenseStatusDetail from "@/pages/LicenseStatusDetail.vue";
import LicenseWorkflows from "@/pages/LicenseWorkflows.vue";
import CaseExport from "@/pages/CaseExport.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/statuses", name: "Statuses", component: Statuses, },
  { path: "/statuses/:id", name: "StatusDetail", component: StatusDetail, },
  { path: "/case-workflows", name: "CaseWorkflows", component: CaseWorkflows },
  { path: "/accounting", name: "Accounting", component: Accounting },
  { path: "/inspection-types", name: "InspectionTypes", component: InspectionTypes },
  { path: "/inspection-types/new", name: "InspectionTypeNew", component: InspectionTypeDetail },
  { path: "/inspection-types/:id", name: "InspectionTypeDetail", component: InspectionTypeDetail },
  { path: "/inspection-workflows/new", name: "InspectionWorkflowNew", component: InspectionWorkflowDetail },
  { path: "/inspection-workflows/:id", name: "InspectionWorkflowDetail", component: InspectionWorkflowDetail },
  { path: "/license-statuses", name: "LicenseStatuses", component: LicenseStatuses },
  { path: "/license-statuses/new", name: "LicenseStatusNew", component: LicenseStatusDetail },
  { path: "/license-statuses/:id", name: "LicenseStatusDetail", component: LicenseStatusDetail },
  { path: "/license-workflows", name: "LicenseWorkflows", component: LicenseWorkflows },
  { path: "/case-export", name: "CaseExport", component: CaseExport },

];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
