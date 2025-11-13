import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react

export const authClient = createAuthClient({
  $InferAuth: {
    user: {
      additionalFields: {
        role: {
          type: ["CANDIDATE", "RECRUITER"],
          defaultValue: null,
          input: true,
        },
      },
    },
  },
});

export type Session = typeof authClient.$Infer.Session.session & {
  user: typeof authClient.$Infer.Session.user & {
    role: "CANDIDATE" | "RECRUITER";
  };
};
