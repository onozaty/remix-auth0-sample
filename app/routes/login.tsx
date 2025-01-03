import { Form } from "@remix-run/react";

export default function Login() {
  return (
    <div className="m-4">
      <Form action="/auth" method="post">
        <button className="bg-blue-500 hover:bg-blue-400 text-white rounded px-4 py-2">
          Login with Auth0
        </button>
      </Form>
    </div>
  );
}
