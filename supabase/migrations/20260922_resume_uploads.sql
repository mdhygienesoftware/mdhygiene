-- Resume attachments on the careers form.
--
-- A private bucket, not the public `media` one. A CV carries someone's home
-- address, phone number and employment history; on a public bucket that sits
-- behind nothing but an unguessable URL, and URLs leak. Here, reading requires
-- a signed link that an admin's session mints and that expires.
--
-- Anyone may write. That is the point — the applicant is not signed in — and
-- it is bounded by the bucket's own size and type limits rather than by trust.
-- Nobody but an admin may list, read, overwrite or delete.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760, -- 10 MB, mirrored by RESUME_MAX_BYTES in lib/resume.ts
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can attach a resume" on storage.objects;
drop policy if exists "Admins can read resumes" on storage.objects;
drop policy if exists "Admins can remove resumes" on storage.objects;

-- Write only, and only under applications/ — no reading back, so one applicant
-- cannot fish for another's file, and no overwriting an existing one.
create policy "Anyone can attach a resume"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = 'applications'
  );

create policy "Admins can read resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and exists (select 1 from public.admin_profiles where id = auth.uid())
  );

create policy "Admins can remove resumes"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and exists (select 1 from public.admin_profiles where id = auth.uid())
  );
