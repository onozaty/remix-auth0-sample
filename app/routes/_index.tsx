import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { isAuthenticated } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await isAuthenticated(request);

  return { user };
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="m-4">
      <h1 className="text-xl mb-2">Login succeeded</h1>
      {user && (
        <>
          <p className="mb-2">{user.email}</p>
          <Form action="auth/logout" method="post">
            <button className="bg-gray-500 hover:bg-gray-400 text-white rounded px-4 py-2">
              Logout
            </button>
          </Form>
        </>
      )}
    </div>
  );
}
