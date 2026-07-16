begin;

select plan(1);
select has_schema('public', 'public schema is available');

select * from finish();
rollback;
