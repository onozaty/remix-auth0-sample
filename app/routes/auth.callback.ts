import { LoaderFunctionArgs } from "@remix-run/node";
import { callbackAuthenticate } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await callbackAuthenticate(request);
};
