import { request } from "./tasks.js";

export const fetchTeamMembers = (user) => request("/team", { user });

export const createTeamMember = (user, member) =>
  request("/team", {
    user,
    method: "POST",
    body: JSON.stringify(member)
  });

export const deleteTeamMember = (user, id) =>
  request(`/team/${id}`, {
    user,
    method: "DELETE"
  });
