import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/utils/auth.server";

export const loader = () => redirect("/");

export const action = async ({ request }: ActionFunctionArgs) => {
  return await authenticate(request);
};
