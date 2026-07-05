-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    read_time_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_article_bookmarks table
CREATE TABLE IF NOT EXISTS public.user_article_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, article_id)
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_bookmarks ENABLE ROW LEVEL SECURITY;

-- Articles Policies: Public read access
CREATE POLICY "Articles are viewable by everyone"
    ON public.articles FOR SELECT
    USING (true);

CREATE POLICY "Articles can only be modified by admins"
    ON public.articles FOR ALL
    USING (false); -- Replace with actual admin check if needed

-- Bookmarks Policies: Users can only see and manage their own bookmarks
CREATE POLICY "Users can view own bookmarks"
    ON public.user_article_bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
    ON public.user_article_bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
    ON public.user_article_bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- Insert Seed Data
INSERT INTO public.articles (id, title, summary, content, category, image_url, tags, read_time_minutes)
VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Stay Protected During Flu Season',
    'Essential tips to keep your immune system strong and prevent the flu this winter.',
    'Flu season is here, and it is more important than ever to take preventive measures to protect yourself and your family. 

### 1. Get Vaccinated
The most effective way to prevent the flu is by getting an annual flu vaccine. It reduces your chances of getting sick and can make the symptoms milder if you do catch it.

### 2. Practice Good Hygiene
Wash your hands frequently with soap and water for at least 20 seconds. If soap is not available, use an alcohol-based hand sanitizer. Avoid touching your eyes, nose, and mouth.

### 3. Boost Your Immune System
Eat a balanced diet rich in vitamins and minerals, get enough sleep, and stay physically active. Vitamin C and Zinc are particularly helpful during this season.

### 4. Stay Home if You Are Sick
If you experience flu-like symptoms, stay home to prevent spreading the virus to others. Drink plenty of fluids and rest.',
    'Seasonal',
    'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=600&auto=format&fit=crop',
    ARRAY['flu', 'winter', 'prevention', 'vaccine'],
    4
),
(
    '22222222-2222-2222-2222-222222222222',
    'Dengue Fever Alert: Prevention Guide',
    'As monsoon season approaches, learn how to prevent mosquito breeding and protect against Dengue.',
    'Dengue fever is a mosquito-borne viral disease occurring in tropical and subtropical areas. With the rainy season approaching, cases often spike.

### Eliminate Mosquito Breeding Sites
Mosquitoes that carry Dengue breed in clean, stagnant water.
- Empty, cover, or throw out items that hold water, such as tires, buckets, planters, toys, or trash containers.
- Change the water in pet dishes and birdbaths frequently.
- Clean out gutters to ensure water flows freely.

### Protect Yourself from Bites
- Wear long-sleeved shirts and long pants when outdoors.
- Use EPA-registered insect repellents containing DEET, Picaridin, or IR3535.
- Use mosquito nets if sleeping outdoors or in an area without screens.

### Know the Symptoms
Sudden high fever, severe headaches, pain behind the eyes, joint and muscle pain, fatigue, nausea, and skin rash. Seek medical attention immediately if you experience these symptoms.',
    'Seasonal',
    'https://images.unsplash.com/photo-1627885775390-34863fa9dd28?q=80&w=600&auto=format&fit=crop',
    ARRAY['dengue', 'mosquito', 'monsoon', 'fever'],
    5
),
(
    '33333333-3333-3333-3333-333333333333',
    'The Power of Hydration',
    'Why drinking enough water is the simplest and most effective lifestyle change you can make.',
    'Water is essential for life, yet many of us do not drink enough of it daily. 

### Why Hydration Matters
Water makes up about 60% of your body weight. It flushes toxins out of vital organs, carries nutrients to your cells, and provides a moist environment for ear, nose, and throat tissues.

### Signs of Dehydration
- Dark yellow urine
- Dry mouth and lips
- Fatigue
- Headaches and dizziness

### How to Drink More Water
- Carry a reusable water bottle with you wherever you go.
- Drink a glass of water first thing in the morning.
- Flavor your water with fresh fruits like lemon, lime, or cucumber if you find plain water boring.
- Eat water-rich foods like watermelon, strawberries, and spinach.',
    'Lifestyle',
    'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?q=80&w=600&auto=format&fit=crop',
    ARRAY['water', 'hydration', 'health', 'diet'],
    3
),
(
    '44444444-4444-4444-4444-444444444444',
    'Preventive Health Screenings by Age',
    'A comprehensive guide to the medical checkups and screenings you should have at every stage of life.',
    'Preventive screenings can detect diseases early when they are most treatable.

### In Your 20s and 30s
- **Blood Pressure:** Check every 2 years.
- **Cholesterol:** Check every 4-6 years.
- **Skin Check:** Annually, especially if you have a family history of skin cancer.
- **Dental & Vision:** Annually.

### In Your 40s
- **Diabetes Screening:** Every 3 years.
- **Mammogram (Women):** Discuss starting annual screenings with your doctor.
- **Prostate Screening (Men):** Discuss with your doctor if you are at high risk.

### In Your 50s and Beyond
- **Colonoscopy:** Every 10 years starting at age 45-50.
- **Bone Density:** For women 65+ or earlier if at risk.
- **Hearing Test:** Every 3 years.

Consult your primary care physician to tailor a screening schedule that fits your personal and family medical history.',
    'Preventive Care',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop',
    ARRAY['screening', 'checkup', 'prevention', 'aging'],
    6
)
ON CONFLICT DO NOTHING;
