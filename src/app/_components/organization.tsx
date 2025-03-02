'use client';
import {authClient} from "~/server/auth/client";
import { api } from "~/trpc/react";

export function OrganizationList() {

  const { data, error } = api.auth.getListOrganization.useQuery(undefined, {
    onError: (err) => {
      console.error("Error fetching secret message:", err);
    },
  });

  const { data: activeOrganization } = authClient.useActiveOrganization()

  const setActiveOrganization = async (id: string) => {
    await authClient.organization.setActive({
      organizationId: id
    })
  }
  if(!data){
    return null
  }

  return (
    <div className="w-full max-w-xs">
      {data.map((organization) => (
        <button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20" style={{
          color: activeOrganization?.id === organization.id ? 'red' : ''
        }}  key={organization.id} onClick={async () => {
          await setActiveOrganization(organization.id)
        }}>
          {organization.name}
        </button>
      ))}
    </div>
  );
}

export function SessionName() {
  const { data, error } = api.auth.getSecretMessage.useQuery(undefined, {
    onError: (err) => {
      console.error("Error fetching secret message:", err);
    },
  });

  if (error) {
    return <div>You must be logged in to see this content.</div>;
  }

  return data ? <div>{data}</div> : <div>Loading...</div>;
}

export function CreateOrganization() {
  const utils = api.useUtils();

  const createOrganization = api.auth.createOrganization.useMutation({
    onSuccess: async (data) => {
      console.log({data})
      await utils.auth.invalidate();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleCreate = async () => {
    createOrganization.mutate({ name: "Test sdsad no sadsad wy" });
  };


  return (<button
    onClick={handleCreate}
    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
  >
    Create organization
  </button>)
}

export function LinkFacebook() {
  const { data: activeOrganization } = authClient.useActiveOrganization()

  const linkAccount = api.auth.linkAccountWithOrganization.useMutation({
    onSuccess: async ({ url }) => {
      window.location.href = url;
      console.log({ url });
    },
  });

  return (<button
    onClick={() => {
      if(!activeOrganization){
        return;
      }
      linkAccount.mutate({provider: 'facebook', organizationId: activeOrganization.id});
      return;
    }}
    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
  >
    Link Facebook
  </button>)
}