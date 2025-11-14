import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Statuses from "@/pages/Statuses.vue";
import Dashboard from "@/pages/Dashboard.vue";
import StatusDetail from "@/pages/StatusDetail.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/statuses", name: "Statuses", component: Statuses },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/statuses", name: "StatusesList", component: Statuses, },
  { path: "/statuses/:id", name: "StatusDetail", component: StatusDetail, },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
