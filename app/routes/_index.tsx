import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = context.user as {
    userId: number;
    email: string;
  };

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
          <Link to="/hoge">Hoge</Link>
        </>
      )}
    </div>
  );
}
