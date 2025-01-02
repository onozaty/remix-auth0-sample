import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return { user };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  console.log(data);

  return (
    <div>
      <h1>Login succeeded</h1>
      {data.user && (
        <>
          <Form action="auth/logout" method="post">
            <button>Logout</button>
          </Form>
          <p>{data.user.displayName}</p>
        </>
      )}
    </div>
  );
}
