# Baby First Foods App

### Product Requirements Document

## 1. Product Vision

Build the simplest, calmest and most trustworthy way for parents to navigate their baby's transition to solid foods.

The product helps parents answer four questions:

1. **What can my baby safely eat?**
2. **How should I prepare it for their age and development?**
3. **What foods and allergens has my baby already tried?**
4. **What should I introduce or serve next?**

The product should reduce cognitive load rather than add to it.

**Core promise:**

> Know what to serve. Know what's been tried. Feel good about what's next.

---

# 2. Target User

Primary user:

Parents/caregivers of babies approximately 4–18 months beginning or progressing through complementary feeding.

Especially:

* first-time parents
* parents anxious about choking/allergens
* parents who want evidence-informed guidance
* parents who enjoy modern wellness/parenting products
* parents who want to track progress without maintaining spreadsheets
* working parents who need fast answers
* families where multiple caregivers feed the baby

The emotional target is not "perfect parent."

It is:

> **A loving parent who wants to feel confident they're doing a good job.**

---

# 3. Product Principles

### Calm over fear

Safety information should be clear without catastrophizing.

### One action should equal one log

If a parent feeds peanut butter, they should not need to log three separate things.

### Baby-first, not food-first

The product revolves around the baby's journey rather than a giant food database.

### Safety information is foundational

Core food safety information should remain accessible.

### Personalization increases over time

Every food logged should make the product more useful.

### No guilt

Never communicate missed foods or allergens as parental failure.

Use language such as:

> "Peanut hasn't been served recently."

Not:

> "You're overdue!"

---

# 4. Primary Navigation

## Home

Today's overview and next best action.

## Explore

Searchable food database.

## Ideas

Recipes and meal ideas.

## Allergens

Allergen introduction and ongoing exposure dashboard.

## Baby

Food history, preferences and profile.

---

# 5. Home Screen

Display:

### Baby profile

Name, age and feeding stage.

### Food progress

* foods tried
* favorite foods
* foods recently introduced

### Allergen summary

* established
* introducing
* not introduced
* recent exposures

### Today's suggestion

One personalized food or meal suggestion.

### Quick Add

Allow the parent to log a food in one or two taps.

---

# 6. Food Database

Each food contains:

* age/stage suitability
* preparation instructions
* serving shape/size
* texture guidance
* choking considerations
* allergen classification
* nutritional information
* cooking requirements
* storage information
* expert-reviewed guidance
* baby-specific history

Example:

## Banana

**Baby's status**

✓ Tried
❤️ Favorite
Served 6 times

**How to serve**

6–8 months
Soft strips / mashed

9–12 months
Smaller soft pieces

12+ months
Bite-size pieces

**Allergen**

None

**Safety**

Avoid hard or inadequately softened pieces.

---

# 7. Food Logging

The logging experience must be extremely fast.

Parent taps:

**+ Add food**

Searches or selects:

Banana

Then:

**How did baby respond?**

❤️ Loved it
🙂 Liked it
😐 Neutral
🙅 Didn't like it
⚠️ Possible reaction

Optional:

* amount
* preparation
* notes
* photo

The app automatically updates:

* food history
* preferences
* allergen history
* recipe personalization

---

# 8. Allergen System

The system distinguishes between:

### Not introduced

No recorded exposure.

### Introduction in progress

Parent is intentionally introducing the food and recording exposures.

### Successfully introduced

The food has been tolerated through the parent's chosen introduction process.

### Ongoing exposure

Food has been successfully introduced and is being served periodically.

The app must explicitly state that successful introduction tracking is **not a medical guarantee that an allergy is impossible**.

Parents should be directed to healthcare professionals for suspected reactions or higher-risk situations.

---

# 9. Allergen Dashboard

This is the primary differentiating feature.

Display major common allergens as cards.

Each card contains:

* status
* introduction progress
* last exposure
* exposures in recent period
* reaction history
* quick-log button

Example:

### 🥜 Peanut

**Established ✓**

Last served: 3 days ago

This week: 2 exposures

[ + Log peanut ]

---

### 🌾 Wheat

**Introduction 2/3**

Last served: yesterday

[ Continue ]

---

### 🥚 Egg

**Established ✓**

Last served: today

This week: 3 exposures

---

The parent should understand the entire allergen landscape in under five seconds.

---

# 10. Recipe System

Recipes should be generated primarily from foods the baby has already tolerated.

Filters:

* age
* preparation time
* ingredients available
* allergens already introduced
* new allergens
* favorite foods
* disliked foods
* iron-rich
* breakfast
* lunch
* dinner
* snack
* family meal
* freezer friendly

Recipes should clearly identify allergens.

Example:

**Banana Peanut Oat Bowl**

5 minutes

Ingredients:

* banana
* oats
* peanut butter

Contains:
🥜 Peanut

Baby status:
✓ All ingredients previously introduced

---

# 11. Personalized Recommendations

The recommendation engine should consider:

* baby's age
* foods tried
* allergens introduced
* recent allergen exposure history
* food preferences
* disliked foods
* parent-selected dietary constraints
* available ingredients
* previous meals

The goal is not to tell parents what they "should" feed their child.

The goal is to reduce decision fatigue.

---

# 12. Baby Food History

Timeline view:

**October 5**

Breakfast
🍌 Banana
🥜 Peanut
🌾 Oats

Lunch
🥑 Avocado
🥚 Egg

Dinner
🐟 Salmon
🍠 Sweet potato

The parent can tap any food to view its history.

---

# 13. Preferences

Each food maintains a simple relationship state:

❤️ Loved
🙂 Likes
😐 Neutral
🙅 Dislikes
⚠️ Reaction/concern

The system can eventually identify patterns:

> "Emma tends to enjoy soft fruits and mashed foods."

or:

> "Emma has tried broccoli four times. Today's response was positive."

No pressure to force foods.

---

# 14. Notifications

Notifications should be minimal.

Useful examples:

> "Peanut hasn't been served recently. Want to log an exposure?"

> "You started egg yesterday. Ready to continue your introduction?"

> "You haven't logged anything today. That's okay — log whenever you're ready."

Avoid guilt-based messaging.

---

# 15. Safety Content Governance

Safety content must come from an expert-reviewed structured database.

AI must not independently invent:

* serving sizes
* choking recommendations
* allergen protocols
* medical diagnoses
* treatment instructions

AI may retrieve and combine approved content to answer questions and personalize meal suggestions.

Every safety-critical answer should be traceable to an approved source.

---

# 16. MVP Success Metrics

### Activation

% of users who:

* create baby profile
* view first food
* log first food

### Core engagement

* foods logged per active user
* allergen exposures logged
* weekly active parents
* repeat usage

### Product value

% of parents who say:

> "I feel more confident introducing foods."

### Retention

7-day
30-day
90-day

### Key product metric

**Weekly successful food/allergen logging sessions per active family**

---

# 17. Monetization

Free:

* food database
* basic preparation guidance
* food history
* basic allergen dashboard

Premium:

* advanced allergen tracking
* personalized recipes
* personalized recommendations
* reminders
* caregiver synchronization
* advanced insights
* AI food assistant

Target pricing:

**$4.99–$7.99/month**

or

**~$39.99/year**

The product should feel dramatically more accessible than a $100/year subscription.

---

# 18. Brand

Tone:

Warm
Calm
Smart
Reassuring
Modern
Non-judgmental

Avoid:

* baby-talk
* excessive hearts
* fear-based language
* clinical coldness
* guilt
* gamification that makes parents feel behind

Visual direction:

Warm neutrals + soft natural colors + modern typography + subtle food/ingredient illustrations.

The product should feel like:

**a beautiful wellness app made specifically for parents.**

---

# 19. V1 Differentiator

The single strongest feature should be:

# The Allergen Dashboard

The parent should be able to open the app and immediately understand:

**What has been introduced?**

**What's currently being introduced?**

**How many exposures have been logged?**

**When was each allergen last served?**

**What needs attention?**

Everything else supports this experience.

---

# 20. Long-Term Vision

The product eventually becomes a personalized food-development record for the baby's first years.

It understands:

* what baby eats
* what baby likes
* what baby dislikes
* what textures baby prefers
* what allergens have been introduced
* what meals work
* what foods are available
* what parents actually cook
* how baby's preferences evolve

The long-term product is not merely a recipe app.

It is:

> **A calm digital companion for one of the biggest transitions in early childhood.**
