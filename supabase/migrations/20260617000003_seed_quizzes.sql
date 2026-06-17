-- ============================================================
-- Seed 4 additional courses (placeholder playlist IDs —
-- will be matched when the user opens the same topic from catalog,
-- or can be updated in the dashboard to match a real playlist ID).
-- ============================================================

insert into public.courses (title, description, category, youtube_playlist_id, lesson_count)
values
  (
    'JavaScript for Beginners',
    'Learn JavaScript from scratch — variables, functions, DOM, and async programming.',
    'Programming',
    'PLr6ZBt9MsUxuqS8cCDV0Rk4P5rWvXyMOq',
    30
  ),
  (
    'HTML & CSS Full Course',
    'Build modern, responsive websites using HTML5 and CSS3.',
    'Web Development',
    'PLr6ZBt9MsUxuVZrD0HgNwkKtfIKcJvVxP',
    25
  ),
  (
    'Data Science with Python',
    'Master pandas, NumPy, matplotlib, and scikit-learn for data analysis.',
    'Data Science',
    'PLr6ZBt9MsUxuTqS8cCDV1Rk5P3rWvXyNOr',
    35
  ),
  (
    'Machine Learning Fundamentals',
    'Understand supervised and unsupervised learning, neural networks, and model evaluation.',
    'AI & ML',
    'PLr6ZBt9MsUxuVZrE0HgNwkKtfIKcJvVyQ',
    28
  )
on conflict (youtube_playlist_id) do nothing;

-- ============================================================
-- Create quizzes — one per course
-- ============================================================

-- 1. Python for Beginners
with py_course as (
  select id from public.courses
  where title ilike '%Python for Beginners%'
  limit 1
),
py_quiz as (
  insert into public.quizzes (course_id, title)
  select id, 'Python for Beginners — Final Quiz' from py_course
  returning id
)
insert into public.quiz_questions (quiz_id, question, options, correct_index, position)
select
  py_quiz.id,
  q.question,
  q.options,
  q.correct_index,
  q.position
from py_quiz,
(values
  ('What keyword is used to define a function in Python?',    ARRAY['func','def','function','lambda'],       1, 0),
  ('Which data type is immutable in Python?',                  ARRAY['list','dict','tuple','set'],             2, 1),
  ('What does len("hello") return?',                           ARRAY['4','5','6','hello'],                     1, 2),
  ('How do you start a comment in Python?',                    ARRAY['//','/*','#','--'],                      2, 3),
  ('Which loop is guaranteed to run at least once?',           ARRAY['for','while','do-while','Python has none'],3, 4)
) as q(question, options, correct_index, position);

-- 2. JavaScript for Beginners
with js_course as (
  select id from public.courses
  where title ilike '%JavaScript for Beginners%'
  limit 1
),
js_quiz as (
  insert into public.quizzes (course_id, title)
  select id, 'JavaScript Essentials — Quiz' from js_course
  returning id
)
insert into public.quiz_questions (quiz_id, question, options, correct_index, position)
select
  js_quiz.id,
  q.question,
  q.options,
  q.correct_index,
  q.position
from js_quiz,
(values
  ('Which keyword declares a block-scoped variable?',          ARRAY['var','let','const','function'],          1, 0),
  ('What does === check?',                                     ARRAY['Value only','Type only','Value and type','Neither'], 2, 1),
  ('How do you write a comment in JS?',                        ARRAY['# comment','<!-- -->','// comment','** comment'], 2, 2),
  ('Which method adds an element to the end of an array?',     ARRAY['push()','pop()','shift()','unshift()'],  0, 3),
  ('What is the output of typeof null?',                       ARRAY['"null"','"undefined"','"object"','"boolean"'], 2, 4)
) as q(question, options, correct_index, position);

-- 3. HTML & CSS Full Course
with html_course as (
  select id from public.courses
  where title ilike '%HTML & CSS%'
  limit 1
),
html_quiz as (
  insert into public.quizzes (course_id, title)
  select id, 'HTML & CSS Mastery — Quiz' from html_course
  returning id
)
insert into public.quiz_questions (quiz_id, question, options, correct_index, position)
select
  html_quiz.id,
  q.question,
  q.options,
  q.correct_index,
  q.position
from html_quiz,
(values
  ('What does HTML stand for?',                                ARRAY['Hyper Text Markup Language','High Tech Modern Language','Hyper Transfer Markup Logic','Hyper Text Making Language'], 0, 0),
  ('Which CSS property controls text size?',                   ARRAY['font-weight','text-size','font-size','text-scale'],  2, 1),
  ('Which HTML tag creates a hyperlink?',                      ARRAY['<link>','<href>','<a>','<url>'],         2, 2),
  ('What does the CSS box model include?',                     ARRAY['margin, border, padding, content','header, body, footer, content','top, right, bottom, left','none of these'], 0, 3),
  ('Which property makes a flexbox container?',                ARRAY['display: block','display: flex','position: flex','layout: flex'], 1, 4)
) as q(question, options, correct_index, position);

-- 4. Data Science with Python
with ds_course as (
  select id from public.courses
  where title ilike '%Data Science%'
  limit 1
),
ds_quiz as (
  insert into public.quizzes (course_id, title)
  select id, 'Data Science with Python — Quiz' from ds_course
  returning id
)
insert into public.quiz_questions (quiz_id, question, options, correct_index, position)
select
  ds_quiz.id,
  q.question,
  q.options,
  q.correct_index,
  q.position
from ds_quiz,
(values
  ('Which library provides the DataFrame structure?',           ARRAY['NumPy','Matplotlib','Pandas','Scikit-learn'],       2, 0),
  ('What does df.shape return?',                                ARRAY['Column names','Row count only','(rows, cols) tuple','Data types'], 2, 1),
  ('Which function reads a CSV file in Pandas?',                ARRAY['pd.open_csv()','pd.read_csv()','pd.load_csv()','pd.import_csv()'], 1, 2),
  ('What does NaN stand for?',                                  ARRAY['Not a Node','Not a Number','Null and None','Negative and Neutral'], 1, 3),
  ('Which Matplotlib function displays a plot?',                ARRAY['plt.render()','plt.draw()','plt.show()','plt.display()'], 2, 4)
) as q(question, options, correct_index, position);

-- 5. Machine Learning Fundamentals
with ml_course as (
  select id from public.courses
  where title ilike '%Machine Learning%'
  limit 1
),
ml_quiz as (
  insert into public.quizzes (course_id, title)
  select id, 'Machine Learning — Final Quiz' from ml_course
  returning id
)
insert into public.quiz_questions (quiz_id, question, options, correct_index, position)
select
  ml_quiz.id,
  q.question,
  q.options,
  q.correct_index,
  q.position
from ml_quiz,
(values
  ('What type of learning uses labelled data?',                ARRAY['Unsupervised','Reinforcement','Supervised','Transfer'],      2, 0),
  ('Which algorithm is used for classification AND regression?',ARRAY['K-Means','Linear Regression','Decision Tree','PCA'],        2, 1),
  ('What does overfitting mean?',                              ARRAY['Model is too simple','Model performs well on new data','Model memorises training data','Model has no parameters'], 2, 2),
  ('Which metric measures classification accuracy?',            ARRAY['MSE','RMSE','F1-Score','R²'],                               2, 3),
  ('What is the purpose of a train/test split?',                ARRAY['Speed up training','Evaluate on unseen data','Reduce dataset size','Improve feature count'], 1, 4)
) as q(question, options, correct_index, position);
