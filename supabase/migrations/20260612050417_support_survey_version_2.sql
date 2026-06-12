drop policy "anonymous users can submit complete survey payloads"
  on public.survey_responses;

create policy "anonymous users can submit complete survey payloads"
  on public.survey_responses
  for insert
  to anon
  with check (
    jsonb_typeof(answers) = 'object'
    and (
      (
        survey_version = '1.0'
        and answers ?& array[
          'q01','q02','q03','q04','q05','q06','q07','q08','q09','q10','q11',
          'q12','q13','q14','q15','q16','q17','q18','q19','q20','q21','q22',
          'q23','q24','q25','q26','q27','q28','q29','q30','q31','q32','q33',
          'q34','q35','q36','q37','q38','q39','q40','q41','q42','q43','q44'
        ]
      )
      or
      (
        survey_version = '2.0'
        and answers ?& array[
          'd01','d02','d03','d04','d05','d06',
          'b01','b02','b03','b04',
          'p01','p02','p03','p04','p05',
          'm01','m02','m03','m04','m05','m06'
        ]
      )
    )
  );
