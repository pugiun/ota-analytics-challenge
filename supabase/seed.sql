-- Seed data for analytics challenge
-- Posts and daily metrics for test users
-- All dates are relative to CURRENT_DATE (last 60 days for comparison support)
--
-- IMPORTANT: Run `npx tsx supabase/seed-users.ts` first to create test users via Admin API
-- This requires SUPABASE_SERVICE_ROLE_KEY environment variable

-- Define user UUIDs for consistency (must match seed-users.ts)
DO $$
DECLARE
  user_a_id UUID := 'a1111111-1111-1111-1111-111111111111';
  user_b_id UUID := 'b2222222-2222-2222-2222-222222222222';
  base_date DATE := CURRENT_DATE;
BEGIN

-- =====================
-- POSTS FOR USER A (36 posts over last 60 days)
-- =====================
INSERT INTO posts (user_id, platform, caption, thumbnail_url, media_type, posted_at, likes, comments, shares, saves, reach, impressions, engagement_rate, permalink) VALUES
-- Last 30 days
(user_a_id, 'instagram', 'Excited to share our latest product launch! What do you think? #startup #launch', 'https://picsum.photos/seed/post1/400/400', 'image', (base_date - INTERVAL '0 days')::timestamp + TIME '14:30:00', 1243, 89, 45, 156, 15420, 18650, 8.2, 'https://instagram.com/p/example1'),
(user_a_id, 'instagram', 'Behind the scenes of our creative process #creativity #design', 'https://picsum.photos/seed/post2/400/400', 'carousel', (base_date - INTERVAL '1 days')::timestamp + TIME '10:15:00', 892, 67, 32, 98, 12350, 14820, 7.1, 'https://instagram.com/p/example2'),
(user_a_id, 'tiktok', 'Quick tutorial on productivity hacks! #productivity #tips', 'https://picsum.photos/seed/post3/400/400', 'video', (base_date - INTERVAL '2 days')::timestamp + TIME '18:45:00', 3421, 234, 567, 289, 45600, 52300, 9.8, 'https://tiktok.com/@user/video/example3'),
(user_a_id, 'instagram', 'Morning coffee vibes. Starting the day right', 'https://picsum.photos/seed/post4/400/400', 'image', (base_date - INTERVAL '3 days')::timestamp + TIME '08:00:00', 756, 45, 12, 67, 8900, 10200, 6.5, 'https://instagram.com/p/example4'),
(user_a_id, 'instagram', 'Team building day! Great energy from everyone #teamwork', 'https://picsum.photos/seed/post5/400/400', 'carousel', (base_date - INTERVAL '5 days')::timestamp + TIME '16:20:00', 1567, 123, 78, 145, 18900, 22100, 8.9, 'https://instagram.com/p/example5'),
(user_a_id, 'tiktok', 'Day in my life as a startup founder #entrepreneur #startup', 'https://picsum.photos/seed/post6/400/400', 'video', (base_date - INTERVAL '6 days')::timestamp + TIME '12:00:00', 5678, 456, 890, 432, 67800, 78900, 11.2, 'https://tiktok.com/@user/video/example6'),
(user_a_id, 'instagram', 'New office space tour! What do you think of the setup?', 'https://picsum.photos/seed/post7/400/400', 'video', (base_date - INTERVAL '8 days')::timestamp + TIME '14:30:00', 2134, 189, 123, 234, 28900, 34500, 9.4, 'https://instagram.com/p/example7'),
(user_a_id, 'instagram', 'Weekend hiking adventure #nature #weekend', 'https://picsum.photos/seed/post8/400/400', 'image', (base_date - INTERVAL '10 days')::timestamp + TIME '11:00:00', 934, 56, 23, 89, 11200, 13400, 7.2, 'https://instagram.com/p/example8'),
(user_a_id, 'tiktok', 'Replying to comments - Q&A session! #qa #community', 'https://picsum.photos/seed/post9/400/400', 'video', (base_date - INTERVAL '12 days')::timestamp + TIME '19:00:00', 4523, 678, 345, 289, 56700, 65400, 10.5, 'https://tiktok.com/@user/video/example9'),
(user_a_id, 'instagram', 'Celebrating 10K followers! Thank you all #milestone #grateful', 'https://picsum.photos/seed/post10/400/400', 'image', (base_date - INTERVAL '14 days')::timestamp + TIME '15:45:00', 2876, 345, 167, 298, 35600, 42100, 10.8, 'https://instagram.com/p/example10'),
(user_a_id, 'instagram', 'Book recommendations for entrepreneurs #reading #books', 'https://picsum.photos/seed/post11/400/400', 'carousel', (base_date - INTERVAL '16 days')::timestamp + TIME '09:30:00', 1123, 89, 56, 187, 14500, 17200, 8.0, 'https://instagram.com/p/example11'),
(user_a_id, 'tiktok', 'How I organize my week for maximum productivity #organization', 'https://picsum.photos/seed/post12/400/400', 'video', (base_date - INTERVAL '18 days')::timestamp + TIME '13:15:00', 6789, 543, 678, 456, 78900, 89100, 12.1, 'https://tiktok.com/@user/video/example12'),
(user_a_id, 'instagram', 'Healthy lunch prep ideas #mealprep #healthy', 'https://picsum.photos/seed/post13/400/400', 'image', (base_date - INTERVAL '20 days')::timestamp + TIME '12:30:00', 678, 34, 18, 56, 7800, 9200, 5.8, 'https://instagram.com/p/example13'),
(user_a_id, 'instagram', 'Sunset from the office rooftop. Perfect end to a busy day', 'https://picsum.photos/seed/post14/400/400', 'image', (base_date - INTERVAL '22 days')::timestamp + TIME '18:00:00', 1456, 78, 45, 123, 16700, 19800, 8.5, 'https://instagram.com/p/example14'),
(user_a_id, 'tiktok', 'My morning routine that changed everything #routine #lifestyle', 'https://picsum.photos/seed/post15/400/400', 'video', (base_date - INTERVAL '24 days')::timestamp + TIME '07:00:00', 8934, 789, 1023, 567, 98700, 112300, 13.5, 'https://tiktok.com/@user/video/example15'),
(user_a_id, 'instagram', 'Workspace setup tour #workspace #setup', 'https://picsum.photos/seed/post16/400/400', 'carousel', (base_date - INTERVAL '26 days')::timestamp + TIME '11:00:00', 2345, 167, 89, 234, 27800, 32400, 9.2, 'https://instagram.com/p/example16'),
(user_a_id, 'instagram', 'Grateful for this journey #reflection', 'https://picsum.photos/seed/post17/400/400', 'carousel', (base_date - INTERVAL '28 days')::timestamp + TIME '20:00:00', 3456, 289, 156, 345, 42300, 49800, 10.1, 'https://instagram.com/p/example17'),
(user_a_id, 'tiktok', 'Best apps for creators #apps #creator', 'https://picsum.photos/seed/post18/400/400', 'video', (base_date - INTERVAL '29 days')::timestamp + TIME '14:00:00', 7654, 612, 834, 489, 87600, 98700, 11.8, 'https://tiktok.com/@user/video/example18'),
-- Prior 30 days (days 30-59)
(user_a_id, 'instagram', 'Product teaser coming soon! Stay tuned #teaser #comingsoon', 'https://picsum.photos/seed/post19/400/400', 'image', (base_date - INTERVAL '31 days')::timestamp + TIME '10:00:00', 987, 56, 23, 78, 9800, 11200, 6.8, 'https://instagram.com/p/example19'),
(user_a_id, 'tiktok', 'Three mistakes I made starting out #mistakes #lessons', 'https://picsum.photos/seed/post20/400/400', 'video', (base_date - INTERVAL '33 days')::timestamp + TIME '15:30:00', 4567, 345, 456, 234, 54300, 62100, 10.2, 'https://tiktok.com/@user/video/example20'),
(user_a_id, 'instagram', 'Weekend vibes with the team #weekend #team', 'https://picsum.photos/seed/post21/400/400', 'carousel', (base_date - INTERVAL '35 days')::timestamp + TIME '14:00:00', 1234, 89, 45, 112, 14500, 16800, 7.5, 'https://instagram.com/p/example21'),
(user_a_id, 'instagram', 'New podcast episode is live! Link in bio #podcast', 'https://picsum.photos/seed/post22/400/400', 'image', (base_date - INTERVAL '37 days')::timestamp + TIME '09:00:00', 876, 67, 34, 89, 10200, 12100, 6.9, 'https://instagram.com/p/example22'),
(user_a_id, 'tiktok', 'How to stay motivated when things get hard #motivation', 'https://picsum.photos/seed/post23/400/400', 'video', (base_date - INTERVAL '39 days')::timestamp + TIME '17:45:00', 5432, 423, 567, 321, 64500, 73800, 10.8, 'https://tiktok.com/@user/video/example23'),
(user_a_id, 'instagram', 'Early morning runs hit different #fitness #morning', 'https://picsum.photos/seed/post24/400/400', 'image', (base_date - INTERVAL '41 days')::timestamp + TIME '06:30:00', 654, 34, 12, 56, 7600, 8900, 5.9, 'https://instagram.com/p/example24'),
(user_a_id, 'instagram', 'Client meeting went great! Exciting projects ahead', 'https://picsum.photos/seed/post25/400/400', 'image', (base_date - INTERVAL '43 days')::timestamp + TIME '16:00:00', 1098, 78, 45, 123, 12300, 14500, 7.8, 'https://instagram.com/p/example25'),
(user_a_id, 'tiktok', 'What I learned from 100 rejections #rejection #growth', 'https://picsum.photos/seed/post26/400/400', 'video', (base_date - INTERVAL '45 days')::timestamp + TIME '12:30:00', 6789, 534, 678, 412, 78900, 89400, 11.5, 'https://tiktok.com/@user/video/example26'),
(user_a_id, 'instagram', 'Design process breakdown for our latest project #design', 'https://picsum.photos/seed/post27/400/400', 'carousel', (base_date - INTERVAL '47 days')::timestamp + TIME '11:15:00', 1876, 145, 89, 198, 21300, 24800, 8.7, 'https://instagram.com/p/example27'),
(user_a_id, 'instagram', 'Friday afternoon thoughts #friday #reflection', 'https://picsum.photos/seed/post28/400/400', 'image', (base_date - INTERVAL '49 days')::timestamp + TIME '17:00:00', 765, 45, 23, 67, 8900, 10400, 6.4, 'https://instagram.com/p/example28'),
(user_a_id, 'tiktok', 'Building in public - week 12 update #buildinpublic', 'https://picsum.photos/seed/post29/400/400', 'video', (base_date - INTERVAL '51 days')::timestamp + TIME '14:00:00', 4321, 312, 423, 267, 51200, 58700, 9.9, 'https://tiktok.com/@user/video/example29'),
(user_a_id, 'instagram', 'Throwback to our first office #throwback #startup', 'https://picsum.photos/seed/post30/400/400', 'image', (base_date - INTERVAL '53 days')::timestamp + TIME '10:30:00', 1543, 112, 67, 145, 17800, 20600, 8.3, 'https://instagram.com/p/example30'),
(user_a_id, 'instagram', 'Event prep in full swing #event #preparation', 'https://picsum.photos/seed/post31/400/400', 'carousel', (base_date - INTERVAL '55 days')::timestamp + TIME '15:45:00', 1234, 89, 45, 112, 14200, 16500, 7.6, 'https://instagram.com/p/example31'),
(user_a_id, 'tiktok', 'Tools every entrepreneur needs #tools #entrepreneur', 'https://picsum.photos/seed/post32/400/400', 'video', (base_date - INTERVAL '57 days')::timestamp + TIME '13:00:00', 5678, 445, 567, 345, 65400, 74800, 10.9, 'https://tiktok.com/@user/video/example32'),
(user_a_id, 'instagram', 'Monthly goals review - crushing it! #goals #progress', 'https://picsum.photos/seed/post33/400/400', 'image', (base_date - INTERVAL '58 days')::timestamp + TIME '09:00:00', 987, 67, 34, 89, 11200, 13100, 7.1, 'https://instagram.com/p/example33'),
(user_a_id, 'tiktok', 'Responding to your questions! #qanda #community', 'https://picsum.photos/seed/post34/400/400', 'video', (base_date - INTERVAL '59 days')::timestamp + TIME '18:30:00', 3456, 267, 345, 198, 41200, 47300, 9.6, 'https://tiktok.com/@user/video/example34');

-- =====================
-- POSTS FOR USER B (34 posts over last 60 days)
-- =====================
INSERT INTO posts (user_id, platform, caption, thumbnail_url, media_type, posted_at, likes, comments, shares, saves, reach, impressions, engagement_rate, permalink) VALUES
-- Last 30 days
(user_b_id, 'instagram', 'Just launched my online course! Link in bio #education #course', 'https://picsum.photos/seed/postb1/400/400', 'image', (base_date - INTERVAL '0 days')::timestamp + TIME '11:00:00', 2156, 178, 89, 267, 26700, 31200, 9.8, 'https://instagram.com/p/exampleb1'),
(user_b_id, 'tiktok', 'POV: When your code finally works #coding #developer', 'https://picsum.photos/seed/postb2/400/400', 'video', (base_date - INTERVAL '1 days')::timestamp + TIME '16:30:00', 12456, 987, 2345, 678, 145600, 167800, 14.2, 'https://tiktok.com/@userb/video/exampleb2'),
(user_b_id, 'instagram', 'Coffee shop coding session #remotework #coding', 'https://picsum.photos/seed/postb3/400/400', 'image', (base_date - INTERVAL '2 days')::timestamp + TIME '09:45:00', 1089, 67, 34, 112, 13400, 15800, 7.5, 'https://instagram.com/p/exampleb3'),
(user_b_id, 'instagram', 'My coding setup evolution over 5 years #setup #evolution', 'https://picsum.photos/seed/postb4/400/400', 'carousel', (base_date - INTERVAL '4 days')::timestamp + TIME '13:20:00', 3421, 234, 145, 389, 41200, 48600, 10.5, 'https://instagram.com/p/exampleb4'),
(user_b_id, 'tiktok', 'Learn React in 60 seconds #react #webdev #tutorial', 'https://picsum.photos/seed/postb5/400/400', 'video', (base_date - INTERVAL '5 days')::timestamp + TIME '18:00:00', 8765, 654, 1234, 543, 98700, 112400, 12.8, 'https://tiktok.com/@userb/video/exampleb5'),
(user_b_id, 'instagram', 'Debugging at 2 AM hits different #developerlife', 'https://picsum.photos/seed/postb6/400/400', 'image', (base_date - INTERVAL '7 days')::timestamp + TIME '02:30:00', 1876, 145, 78, 167, 22300, 26100, 8.9, 'https://instagram.com/p/exampleb6'),
(user_b_id, 'tiktok', 'VS Code extensions you NEED #vscode #coding', 'https://picsum.photos/seed/postb7/400/400', 'video', (base_date - INTERVAL '9 days')::timestamp + TIME '15:15:00', 15678, 1234, 2876, 987, 178900, 198700, 15.6, 'https://tiktok.com/@userb/video/exampleb7'),
(user_b_id, 'instagram', 'First conference talk done! Nervous but nailed it', 'https://picsum.photos/seed/postb8/400/400', 'carousel', (base_date - INTERVAL '11 days')::timestamp + TIME '19:00:00', 4532, 378, 234, 412, 54300, 62800, 11.2, 'https://instagram.com/p/exampleb8'),
(user_b_id, 'instagram', 'Home office upgrade complete #homeoffice #wfh', 'https://picsum.photos/seed/postb9/400/400', 'image', (base_date - INTERVAL '13 days')::timestamp + TIME '10:30:00', 2134, 156, 89, 234, 25600, 29800, 9.1, 'https://instagram.com/p/exampleb9'),
(user_b_id, 'tiktok', 'Why I switched from Mac to Linux #linux #tech', 'https://picsum.photos/seed/postb10/400/400', 'video', (base_date - INTERVAL '15 days')::timestamp + TIME '14:45:00', 9876, 876, 1567, 654, 112300, 128900, 13.4, 'https://tiktok.com/@userb/video/exampleb10'),
(user_b_id, 'instagram', 'Weekend project: Built a smart mirror! #diy #tech', 'https://picsum.photos/seed/postb11/400/400', 'carousel', (base_date - INTERVAL '17 days')::timestamp + TIME '16:00:00', 5678, 456, 287, 489, 67800, 78400, 11.8, 'https://instagram.com/p/exampleb11'),
(user_b_id, 'tiktok', 'AI tools that save me 10 hours a week #ai #productivity', 'https://picsum.photos/seed/postb12/400/400', 'video', (base_date - INTERVAL '19 days')::timestamp + TIME '12:00:00', 18765, 1543, 3421, 1234, 213400, 245600, 16.2, 'https://tiktok.com/@userb/video/exampleb12'),
(user_b_id, 'instagram', 'Mechanical keyboard collection #mechanicalkeyboard', 'https://picsum.photos/seed/postb13/400/400', 'carousel', (base_date - INTERVAL '21 days')::timestamp + TIME '11:30:00', 3456, 267, 145, 378, 41200, 47800, 10.3, 'https://instagram.com/p/exampleb13'),
(user_b_id, 'instagram', 'Late night coding playlist. Drop your favorites below!', 'https://picsum.photos/seed/postb14/400/400', 'image', (base_date - INTERVAL '23 days')::timestamp + TIME '23:00:00', 1567, 234, 56, 145, 18900, 22100, 8.4, 'https://instagram.com/p/exampleb14'),
(user_b_id, 'tiktok', 'From 0 to 100K: My content journey #growth #creator', 'https://picsum.photos/seed/postb15/400/400', 'video', (base_date - INTERVAL '25 days')::timestamp + TIME '10:00:00', 21345, 1876, 4532, 1567, 256700, 289800, 17.8, 'https://tiktok.com/@userb/video/exampleb15'),
(user_b_id, 'instagram', 'New year goals! Let''s go! #motivation', 'https://picsum.photos/seed/postb16/400/400', 'image', (base_date - INTERVAL '27 days')::timestamp + TIME '23:59:00', 2876, 198, 123, 267, 34500, 39800, 9.6, 'https://instagram.com/p/exampleb16'),
(user_b_id, 'tiktok', 'Coding mistakes I made as a beginner #learntocode', 'https://picsum.photos/seed/postb17/400/400', 'video', (base_date - INTERVAL '29 days')::timestamp + TIME '17:00:00', 14532, 1234, 2678, 987, 167800, 189400, 14.9, 'https://tiktok.com/@userb/video/exampleb17'),
-- Prior 30 days (days 30-59)
(user_b_id, 'instagram', 'New desk setup reveal! Clean and minimal #desksetup', 'https://picsum.photos/seed/postb18/400/400', 'carousel', (base_date - INTERVAL '31 days')::timestamp + TIME '12:00:00', 2345, 189, 98, 234, 28900, 33400, 9.4, 'https://instagram.com/p/exampleb18'),
(user_b_id, 'tiktok', 'JavaScript vs TypeScript - which one? #javascript #typescript', 'https://picsum.photos/seed/postb19/400/400', 'video', (base_date - INTERVAL '33 days')::timestamp + TIME '16:00:00', 7654, 567, 1234, 456, 89700, 102300, 12.1, 'https://tiktok.com/@userb/video/exampleb19'),
(user_b_id, 'instagram', 'Coffee and code - perfect combo #coffee #developer', 'https://picsum.photos/seed/postb20/400/400', 'image', (base_date - INTERVAL '35 days')::timestamp + TIME '08:30:00', 1234, 78, 34, 112, 14500, 16800, 7.6, 'https://instagram.com/p/exampleb20'),
(user_b_id, 'instagram', 'Side project progress update #sideproject #indie', 'https://picsum.photos/seed/postb21/400/400', 'carousel', (base_date - INTERVAL '37 days')::timestamp + TIME '14:30:00', 1876, 145, 89, 178, 22100, 25600, 8.8, 'https://instagram.com/p/exampleb21'),
(user_b_id, 'tiktok', 'How I learned to code in 6 months #coding #selftaught', 'https://picsum.photos/seed/postb22/400/400', 'video', (base_date - INTERVAL '39 days')::timestamp + TIME '11:00:00', 9876, 765, 1678, 678, 112300, 128700, 13.6, 'https://tiktok.com/@userb/video/exampleb22'),
(user_b_id, 'instagram', 'Hiking break from screens #hiking #nature #break', 'https://picsum.photos/seed/postb23/400/400', 'image', (base_date - INTERVAL '41 days')::timestamp + TIME '17:00:00', 876, 56, 23, 78, 10200, 11800, 6.8, 'https://instagram.com/p/exampleb23'),
(user_b_id, 'instagram', 'Got my first 1000 subscribers! #milestone #youtube', 'https://picsum.photos/seed/postb24/400/400', 'image', (base_date - INTERVAL '43 days')::timestamp + TIME '19:30:00', 3456, 289, 178, 312, 41200, 47600, 10.6, 'https://instagram.com/p/exampleb24'),
(user_b_id, 'tiktok', 'Git commands everyone should know #git #programming', 'https://picsum.photos/seed/postb25/400/400', 'video', (base_date - INTERVAL '45 days')::timestamp + TIME '13:15:00', 11234, 876, 2134, 765, 134500, 153200, 14.8, 'https://tiktok.com/@userb/video/exampleb25'),
(user_b_id, 'instagram', 'Reading list for Q1 #books #reading #developer', 'https://picsum.photos/seed/postb26/400/400', 'carousel', (base_date - INTERVAL '47 days')::timestamp + TIME '10:00:00', 1567, 123, 67, 189, 18700, 21500, 8.2, 'https://instagram.com/p/exampleb26'),
(user_b_id, 'instagram', 'Upgrading my monitor setup #monitors #productivity', 'https://picsum.photos/seed/postb27/400/400', 'image', (base_date - INTERVAL '49 days')::timestamp + TIME '15:00:00', 2134, 167, 89, 234, 25300, 29100, 9.3, 'https://instagram.com/p/exampleb27'),
(user_b_id, 'tiktok', 'CSS tricks that will blow your mind #css #webdev', 'https://picsum.photos/seed/postb28/400/400', 'video', (base_date - INTERVAL '51 days')::timestamp + TIME '18:30:00', 8765, 654, 1456, 543, 101200, 115800, 13.2, 'https://tiktok.com/@userb/video/exampleb28'),
(user_b_id, 'instagram', 'Freelance life update - pros and cons #freelance', 'https://picsum.photos/seed/postb29/400/400', 'carousel', (base_date - INTERVAL '53 days')::timestamp + TIME '11:45:00', 2567, 198, 112, 267, 30400, 35100, 9.8, 'https://instagram.com/p/exampleb29'),
(user_b_id, 'instagram', 'Late night debugging session #debugging #code', 'https://picsum.photos/seed/postb30/400/400', 'image', (base_date - INTERVAL '55 days')::timestamp + TIME '01:30:00', 1345, 89, 45, 123, 15600, 18100, 7.9, 'https://instagram.com/p/exampleb30'),
(user_b_id, 'tiktok', 'React hooks explained simply #react #hooks #tutorial', 'https://picsum.photos/seed/postb31/400/400', 'video', (base_date - INTERVAL '57 days')::timestamp + TIME '14:00:00', 10234, 789, 1987, 678, 118900, 135400, 14.2, 'https://tiktok.com/@userb/video/exampleb31'),
(user_b_id, 'instagram', 'Celebrating small wins! #wins #progress', 'https://picsum.photos/seed/postb32/400/400', 'image', (base_date - INTERVAL '58 days')::timestamp + TIME '16:30:00', 1876, 145, 78, 167, 21800, 25200, 8.7, 'https://instagram.com/p/exampleb32'),
(user_b_id, 'tiktok', 'API design best practices #api #backend #webdev', 'https://picsum.photos/seed/postb33/400/400', 'video', (base_date - INTERVAL '59 days')::timestamp + TIME '12:00:00', 6543, 512, 1123, 423, 76500, 87300, 11.9, 'https://tiktok.com/@userb/video/exampleb33');

-- =====================
-- DAILY METRICS FOR USER A (last 60 days)
-- =====================
INSERT INTO daily_metrics (user_id, date, engagement, reach) VALUES
-- Last 30 days (current period - higher engagement)
(user_a_id, base_date - INTERVAL '0 days', 1533, 15420),
(user_a_id, base_date - INTERVAL '1 days', 1091, 12350),
(user_a_id, base_date - INTERVAL '2 days', 4511, 45600),
(user_a_id, base_date - INTERVAL '3 days', 880, 8900),
(user_a_id, base_date - INTERVAL '4 days', 1913, 18900),
(user_a_id, base_date - INTERVAL '5 days', 7456, 67800),
(user_a_id, base_date - INTERVAL '6 days', 2680, 28900),
(user_a_id, base_date - INTERVAL '7 days', 1102, 11200),
(user_a_id, base_date - INTERVAL '8 days', 5835, 56700),
(user_a_id, base_date - INTERVAL '9 days', 3686, 35600),
(user_a_id, base_date - INTERVAL '10 days', 1455, 14500),
(user_a_id, base_date - INTERVAL '11 days', 8466, 78900),
(user_a_id, base_date - INTERVAL '12 days', 786, 7800),
(user_a_id, base_date - INTERVAL '13 days', 1702, 16700),
(user_a_id, base_date - INTERVAL '14 days', 11313, 98700),
(user_a_id, base_date - INTERVAL '15 days', 2835, 27800),
(user_a_id, base_date - INTERVAL '16 days', 4246, 42300),
(user_a_id, base_date - INTERVAL '17 days', 9589, 87600),
(user_a_id, base_date - INTERVAL '18 days', 1234, 12400),
(user_a_id, base_date - INTERVAL '19 days', 987, 9800),
(user_a_id, base_date - INTERVAL '20 days', 756, 7500),
(user_a_id, base_date - INTERVAL '21 days', 2345, 23400),
(user_a_id, base_date - INTERVAL '22 days', 1567, 15600),
(user_a_id, base_date - INTERVAL '23 days', 3421, 34200),
(user_a_id, base_date - INTERVAL '24 days', 2876, 28700),
(user_a_id, base_date - INTERVAL '25 days', 1654, 16500),
(user_a_id, base_date - INTERVAL '26 days', 4532, 45300),
(user_a_id, base_date - INTERVAL '27 days', 2198, 21900),
(user_a_id, base_date - INTERVAL '28 days', 1876, 18700),
(user_a_id, base_date - INTERVAL '29 days', 3245, 32400),
-- Prior 30 days (previous period - lower engagement for comparison)
(user_a_id, base_date - INTERVAL '30 days', 1234, 12300),
(user_a_id, base_date - INTERVAL '31 days', 876, 8700),
(user_a_id, base_date - INTERVAL '32 days', 3456, 34500),
(user_a_id, base_date - INTERVAL '33 days', 654, 6500),
(user_a_id, base_date - INTERVAL '34 days', 1456, 14500),
(user_a_id, base_date - INTERVAL '35 days', 5678, 56700),
(user_a_id, base_date - INTERVAL '36 days', 2134, 21300),
(user_a_id, base_date - INTERVAL '37 days', 876, 8700),
(user_a_id, base_date - INTERVAL '38 days', 4567, 45600),
(user_a_id, base_date - INTERVAL '39 days', 2876, 28700),
(user_a_id, base_date - INTERVAL '40 days', 1123, 11200),
(user_a_id, base_date - INTERVAL '41 days', 6543, 65400),
(user_a_id, base_date - INTERVAL '42 days', 567, 5600),
(user_a_id, base_date - INTERVAL '43 days', 1345, 13400),
(user_a_id, base_date - INTERVAL '44 days', 8765, 87600),
(user_a_id, base_date - INTERVAL '45 days', 2234, 22300),
(user_a_id, base_date - INTERVAL '46 days', 3456, 34500),
(user_a_id, base_date - INTERVAL '47 days', 7654, 76500),
(user_a_id, base_date - INTERVAL '48 days', 987, 9800),
(user_a_id, base_date - INTERVAL '49 days', 765, 7600),
(user_a_id, base_date - INTERVAL '50 days', 543, 5400),
(user_a_id, base_date - INTERVAL '51 days', 1876, 18700),
(user_a_id, base_date - INTERVAL '52 days', 1234, 12300),
(user_a_id, base_date - INTERVAL '53 days', 2678, 26700),
(user_a_id, base_date - INTERVAL '54 days', 2234, 22300),
(user_a_id, base_date - INTERVAL '55 days', 1345, 13400),
(user_a_id, base_date - INTERVAL '56 days', 3567, 35600),
(user_a_id, base_date - INTERVAL '57 days', 1765, 17600),
(user_a_id, base_date - INTERVAL '58 days', 1456, 14500),
(user_a_id, base_date - INTERVAL '59 days', 2543, 25400);

-- =====================
-- DAILY METRICS FOR USER B (last 60 days)
-- =====================
INSERT INTO daily_metrics (user_id, date, engagement, reach) VALUES
-- Last 30 days (current period - higher engagement)
(user_b_id, base_date - INTERVAL '0 days', 2690, 26700),
(user_b_id, base_date - INTERVAL '1 days', 16466, 145600),
(user_b_id, base_date - INTERVAL '2 days', 1302, 13400),
(user_b_id, base_date - INTERVAL '3 days', 4189, 41200),
(user_b_id, base_date - INTERVAL '4 days', 11196, 98700),
(user_b_id, base_date - INTERVAL '5 days', 2266, 22300),
(user_b_id, base_date - INTERVAL '6 days', 20775, 178900),
(user_b_id, base_date - INTERVAL '7 days', 5556, 54300),
(user_b_id, base_date - INTERVAL '8 days', 2613, 25600),
(user_b_id, base_date - INTERVAL '9 days', 12973, 112300),
(user_b_id, base_date - INTERVAL '10 days', 6910, 67800),
(user_b_id, base_date - INTERVAL '11 days', 24963, 213400),
(user_b_id, base_date - INTERVAL '12 days', 4246, 41200),
(user_b_id, base_date - INTERVAL '13 days', 2002, 18900),
(user_b_id, base_date - INTERVAL '14 days', 29320, 256700),
(user_b_id, base_date - INTERVAL '15 days', 3464, 34500),
(user_b_id, base_date - INTERVAL '16 days', 19431, 167800),
(user_b_id, base_date - INTERVAL '17 days', 5678, 56700),
(user_b_id, base_date - INTERVAL '18 days', 8765, 87600),
(user_b_id, base_date - INTERVAL '19 days', 3456, 34500),
(user_b_id, base_date - INTERVAL '20 days', 2345, 23400),
(user_b_id, base_date - INTERVAL '21 days', 6789, 67800),
(user_b_id, base_date - INTERVAL '22 days', 4567, 45600),
(user_b_id, base_date - INTERVAL '23 days', 9876, 98700),
(user_b_id, base_date - INTERVAL '24 days', 7654, 76500),
(user_b_id, base_date - INTERVAL '25 days', 5432, 54300),
(user_b_id, base_date - INTERVAL '26 days', 12345, 123400),
(user_b_id, base_date - INTERVAL '27 days', 6543, 65400),
(user_b_id, base_date - INTERVAL '28 days', 4321, 43200),
(user_b_id, base_date - INTERVAL '29 days', 8765, 87600),
-- Prior 30 days (previous period - lower engagement for comparison)
(user_b_id, base_date - INTERVAL '30 days', 2134, 21300),
(user_b_id, base_date - INTERVAL '31 days', 12456, 124500),
(user_b_id, base_date - INTERVAL '32 days', 987, 9800),
(user_b_id, base_date - INTERVAL '33 days', 3245, 32400),
(user_b_id, base_date - INTERVAL '34 days', 8765, 87600),
(user_b_id, base_date - INTERVAL '35 days', 1876, 18700),
(user_b_id, base_date - INTERVAL '36 days', 15678, 156700),
(user_b_id, base_date - INTERVAL '37 days', 4321, 43200),
(user_b_id, base_date - INTERVAL '38 days', 2134, 21300),
(user_b_id, base_date - INTERVAL '39 days', 9876, 98700),
(user_b_id, base_date - INTERVAL '40 days', 5432, 54300),
(user_b_id, base_date - INTERVAL '41 days', 18765, 187600),
(user_b_id, base_date - INTERVAL '42 days', 3456, 34500),
(user_b_id, base_date - INTERVAL '43 days', 1567, 15600),
(user_b_id, base_date - INTERVAL '44 days', 21345, 213400),
(user_b_id, base_date - INTERVAL '45 days', 2876, 28700),
(user_b_id, base_date - INTERVAL '46 days', 14532, 145300),
(user_b_id, base_date - INTERVAL '47 days', 4567, 45600),
(user_b_id, base_date - INTERVAL '48 days', 6789, 67800),
(user_b_id, base_date - INTERVAL '49 days', 2876, 28700),
(user_b_id, base_date - INTERVAL '50 days', 1987, 19800),
(user_b_id, base_date - INTERVAL '51 days', 5432, 54300),
(user_b_id, base_date - INTERVAL '52 days', 3678, 36700),
(user_b_id, base_date - INTERVAL '53 days', 7654, 76500),
(user_b_id, base_date - INTERVAL '54 days', 6123, 61200),
(user_b_id, base_date - INTERVAL '55 days', 4321, 43200),
(user_b_id, base_date - INTERVAL '56 days', 9876, 98700),
(user_b_id, base_date - INTERVAL '57 days', 5234, 52300),
(user_b_id, base_date - INTERVAL '58 days', 3456, 34500),
(user_b_id, base_date - INTERVAL '59 days', 6987, 69800);

END $$;
