> [!IMPORTANT]
> This project is now maintained directly from this repository. The previous
> visual-builder integration is no longer part of the app runtime,
> authentication flow, or build configuration.
>
> Use Supabase Auth as the source of truth for email/password and Google OAuth.
> Keep secrets only in local or deployment environment variables; never commit
> `.env` files or service-role keys.
>
> Use `pnpm` for all dependency and script commands. Do not use npm or bun.
