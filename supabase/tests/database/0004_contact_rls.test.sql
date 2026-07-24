begin;
select plan(6);

select has_table('public'::name, 'contact_submissions'::name, 'contact_submissions table exists');

select has_column('public'::name, 'contact_submissions'::name, 'id', 'has id column');
select has_column('public'::name, 'contact_submissions'::name, 'name', 'has name column');
select has_column('public'::name, 'contact_submissions'::name, 'email', 'has email column');
select has_column('public'::name, 'contact_submissions'::name, 'delivery_status', 'has delivery_status column');

select col_not_null('public'::name, 'contact_submissions'::name, 'name', 'name is not null');
select col_not_null('public'::name, 'contact_submissions'::name, 'email', 'email is not null');
select col_not_null('public'::name, 'contact_submissions'::name, 'message', 'message is not null');

select *
from finish();
rollback;