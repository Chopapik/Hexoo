begin;

do $$
declare
  v_table regclass;
  v_table_name text;
  v_function regprocedure;
  v_function_name text;
  v_role text;
  v_privilege text;
  v_policy_count int;
begin
  foreach v_table_name in array array[
    'public.users',
    'public.posts',
    'public.comments',
    'public.likes',
    'public.post_reports',
    'public.comment_reports',
    'public.moderation_logs',
    'public.activity_logs',
    'public.account_deletion_jobs'
  ] loop
    v_table := v_table_name::regclass;

    if not exists (
      select 1 from pg_class where oid = v_table and relrowsecurity
    ) then
      raise exception 'RLS is not enabled for %', v_table_name;
    end if;

    select count(*) into v_policy_count
    from pg_policies
    where schemaname = 'public'
      and tablename = split_part(v_table_name, '.', 2)
      and roles @> array['service_role']::name[];

    if v_policy_count = 0 then
      raise exception 'Missing service_role policy for %', v_table_name;
    end if;

    foreach v_role in array array['anon', 'authenticated'] loop
      foreach v_privilege in array array['INSERT', 'UPDATE', 'DELETE'] loop
        if has_table_privilege(v_role, v_table, v_privilege) then
          raise exception '% unexpectedly has % on %', v_role, v_privilege, v_table_name;
        end if;
      end loop;
    end loop;

    foreach v_privilege in array array['SELECT', 'INSERT', 'UPDATE', 'DELETE'] loop
      if not has_table_privilege('service_role', v_table, v_privilege) then
        raise exception 'service_role lacks % on %', v_privilege, v_table_name;
      end if;
    end loop;
  end loop;

  foreach v_function_name in array array[
    'public.set_like_state_tx(text,text,text,boolean)',
    'public.create_comment_tx(uuid,text,text,integer,integer,timestamp with time zone,timestamp with time zone,boolean,boolean,text,jsonb,text,jsonb)',
    'public.delete_comment_tx(uuid,uuid)',
    'public.moderator_block_user_tx(text,text,text)',
    'public.moderator_unblock_user_tx(text,text)',
    'public.moderator_review_post_tx(uuid,text,text,text[],text,boolean)',
    'public.moderator_review_comment_tx(uuid,text,text,text[],text,boolean)',
    'public.moderator_review_content_guarded_tx(text,uuid,text,text,text[],text,boolean)',
    'public.begin_account_deletion(text)',
    'public.complete_account_deletion_step(text,text)',
    'public.record_account_deletion_failure(text,text,text)'
  ] loop
    v_function := to_regprocedure(v_function_name);
    if v_function is null then
      raise exception 'Expected RPC is missing: %', v_function_name;
    end if;

    foreach v_role in array array['anon', 'authenticated'] loop
      if has_function_privilege(v_role, v_function, 'EXECUTE') then
        raise exception '% unexpectedly can execute %', v_role, v_function_name;
      end if;
    end loop;

    if not has_function_privilege('service_role', v_function, 'EXECUTE') then
      raise exception 'service_role cannot execute %', v_function_name;
    end if;
  end loop;

  raise notice 'Batch 9 DB security contract checks passed';
end;
$$;

rollback;
