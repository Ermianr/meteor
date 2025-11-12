import { redirect } from "@tanstack/react-router";
import { getSession } from "./auth-client";

export async function forUnAuthUsers() {
  const session = await getSession();

  if (session.data) {
    throw redirect({
      to: "/",
    });
  }
}

export async function forAuthUsers() {
  const session = await getSession();

  if (!session.data) {
    throw redirect({
      to: "/login",
    });
  }
}
