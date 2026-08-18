"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { callRpc, clearFrontendSession, loginThroughBackend, roleHome } from "@/lib/backend";
import { formText } from "@/lib/validation";

function fields(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()]
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, value]) => [key, value.slice(0, 500)]),
  );
}

async function run(action: string, formData?: FormData) {
  const result = await callRpc(action, formData ? fields(formData) : {});
  if (!result.ok) throw new Error("요청을 처리하지 못했습니다.");
  return result;
}

function revalidateAll() {
  revalidatePath("/head", "layout");
  revalidatePath("/nurse", "layout");
}

export async function loginAction(formData: FormData) {
  const name = formText(formData, "name", 40);
  const employeeNumber = formText(formData, "employeeNumber", 20).toUpperCase();
  if (!name || !employeeNumber) redirect("/login?error=missing");
  const user = await loginThroughBackend(name, employeeNumber);
  if (!user) redirect("/login?error=invalid");
  redirect(roleHome(user.role));
}

export async function logoutAction() {
  await run("logoutAction");
  await clearFrontendSession();
  redirect("/login");
}

export async function saveNurseAction(formData: FormData) {
  await run("saveNurseAction", formData);
  revalidatePath("/head/nurses");
}

export async function toggleNurseAction(formData: FormData) {
  await run("toggleNurseAction", formData);
  revalidatePath("/head/nurses");
}

export async function createOffRequestAction(formData: FormData) {
  await run("createOffRequestAction", formData);
  revalidatePath("/nurse/request-off");
}

export async function deleteOffRequestAction(formData: FormData) {
  await run("deleteOffRequestAction", formData);
  revalidatePath("/nurse/request-off");
}

export async function reviewOffRequestAction(formData: FormData) {
  await run("reviewOffRequestAction", formData);
  revalidatePath("/head/requests");
  revalidatePath("/head/dashboard");
}

export async function saveVacationAction(formData: FormData) {
  await run("saveVacationAction", formData);
  revalidatePath("/nurse/vacations");
}

export async function deleteVacationAction(formData: FormData) {
  await run("deleteVacationAction", formData);
  revalidatePath("/nurse/vacations");
}

export async function reviewVacationAction(formData: FormData) {
  await run("reviewVacationAction", formData);
  revalidatePath("/head/vacations");
  revalidatePath("/head/dashboard");
}

export async function ensureScheduleAction(formData: FormData) {
  const result = await run("ensureScheduleAction", formData);
  redirect(result.redirect ?? "/head/schedule");
}

export async function generateScheduleAction(formData: FormData) {
  const result = await run("generateScheduleAction", formData);
  revalidateAll();
  redirect(result.redirect ?? "/head/schedule?error=failed");
}

export async function setScheduleStatusAction(formData: FormData) {
  await run("setScheduleStatusAction", formData);
  revalidateAll();
}

export async function updateRequirementAction(formData: FormData) {
  await run("updateRequirementAction", formData);
  revalidatePath("/head/schedule");
}

export async function createShiftChangeAction(formData: FormData) {
  const result = await run("createShiftChangeAction", formData);
  revalidateAll();
  redirect(result.redirect ?? "/nurse/shift-changes?error=failed");
}

export async function respondShiftChangeAction(formData: FormData) {
  const result = await run("respondShiftChangeAction", formData);
  revalidateAll();
  redirect(result.redirect ?? "/nurse/shift-changes?error=failed");
}

export async function cancelShiftChangeAction(formData: FormData) {
  const result = await run("cancelShiftChangeAction", formData);
  revalidateAll();
  redirect(result.redirect ?? "/nurse/shift-changes?error=failed");
}

export async function reviewShiftChangeAction(formData: FormData) {
  const result = await run("reviewShiftChangeAction", formData);
  revalidateAll();
  redirect(result.redirect ?? "/head/shift-changes?error=failed");
}

export async function resetDemoDataAction() {
  await run("resetDemoDataAction");
  await clearFrontendSession();
  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}
