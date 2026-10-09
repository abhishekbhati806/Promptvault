"""Seed the database with the 12 starter prompts.

Usage:  cd server && python seed.py
"""
from datetime import datetime, timezone


PROMPTS = [
    {
        "id": "p-01",
        "title": "Senior Code Reviewer",
        "description": "Get a rigorous, production-grade review of any code snippet with security and performance notes.",
        "prompt": (
            "You are a senior software engineer at a top tech company. Review the code below.\n"
            "1. Summarize what the code does in two sentences.\n"
            "2. List bugs, security risks and performance issues, ordered by severity.\n"
            "3. Rewrite the code with the fixes applied.\n"
            "4. Suggest two tests I should add.\n"
            "Keep the tone direct. Here is the code:"
        ),
        "category": "coding",
        "tags": ["code-review", "debugging", "best-practices"],
        "author": "Aarav S.",
        "difficulty": "advanced",
        "likes": 214,
        "featured": True,
        "created_at": datetime(2026, 7, 14, 9, 30, tzinfo=timezone.utc),
    },
    {
        "id": "p-02",
        "title": "Blog Post Writer",
        "description": "A structured 900-word blog post with hook, subheads, examples and a call to action.",
        "prompt": (
            "Act as an expert content writer. Write a 900-word blog post about {topic}.\n"
            "Requirements:\n"
            "- Hook: open with a surprising fact or question.\n"
            "- Use H2 subheadings and short paragraphs.\n"
            "- Include one real-world example and one statistic (mark invented stats with [verify]).\n"
            "- End with a 3-point summary and a call to action.\n"
            "Tone: friendly but authoritative."
        ),
        "category": "writing",
        "tags": ["blog", "content", "seo"],
        "author": "Meera K.",
        "difficulty": "intermediate",
        "likes": 342,
        "featured": True,
        "created_at": datetime(2026, 7, 28, 14, 5, tzinfo=timezone.utc),
    },
    {
        "id": "p-03",
        "title": "Socratic Tutor",
        "description": "Learn any topic by being guided with questions instead of getting answers handed over.",
        "prompt": (
            "You are a Socratic tutor. I want to learn: {topic}.\n"
            "Rules:\n"
            "- Never give the full answer directly.\n"
            "- Ask one guiding question at a time.\n"
            "- If I am stuck, give a hint, then a smaller hint, then the answer.\n"
            "- After each round, tell me my current level (guessing / understanding / confident)."
        ),
        "category": "education",
        "tags": ["learning", "tutoring", "questions"],
        "author": "Ravi T.",
        "difficulty": "beginner",
        "likes": 289,
        "featured": True,
        "created_at": datetime(2026, 8, 9, 18, 40, tzinfo=timezone.utc),
    },
    {
        "id": "p-04",
        "title": "Startup Pitch Critic",
        "description": "A skeptical VC tears your pitch apart so you find the weak spots before investors do.",
        "prompt": (
            "Act as a skeptical venture capitalist. I will paste my startup pitch.\n"
            "- Find the 3 weakest claims and say why an investor would reject them.\n"
            "- Ask the 5 toughest questions I should be able to answer.\n"
            "- Rewrite my value proposition in one sentence, under 20 words.\n"
            "Be specific, not generic."
        ),
        "category": "business",
        "tags": ["startup", "pitch", "funding"],
        "author": "Sana P.",
        "difficulty": "intermediate",
        "likes": 176,
        "featured": False,
        "created_at": datetime(2026, 8, 12, 11, 0, tzinfo=timezone.utc),
    },
    {
        "id": "p-05",
        "title": "SEO Meta Generator",
        "description": "Title tags, meta descriptions, keywords and slugs — SEO-ready in one shot.",
        "prompt": (
            "Create SEO metadata for the following webpage: {page content or description}.\n"
            "Return exactly:\n"
            "- 3 title tag options (≤60 characters)\n"
            "- 3 meta descriptions (≤155 characters, with a CTA)\n"
            "- 5 focus keywords and 2 long-tail keywords\n"
            "- Suggested URL slug\n"
            "Pick the primary keyword that balances search volume and relevance."
        ),
        "category": "marketing",
        "tags": ["seo", "metadata", "keywords"],
        "author": "Dev M.",
        "difficulty": "beginner",
        "likes": 154,
        "featured": False,
        "created_at": datetime(2026, 8, 15, 8, 20, tzinfo=timezone.utc),
    },
    {
        "id": "p-06",
        "title": "Daily Planner",
        "description": "Turn a messy task list into a focused day with deep-work blocks and a clear 'do not do'.",
        "prompt": (
            "You are a productivity coach. Here is my task list for tomorrow: {tasks}.\n"
            "- Rank tasks by impact × urgency.\n"
            "- Group them into three 90-minute deep-work blocks.\n"
            "- Tell me the one task I should NOT do tomorrow and why.\n"
            "- End with a 2-minute morning routine to start focused."
        ),
        "category": "productivity",
        "tags": ["planning", "focus", "time-management"],
        "author": "Ishita R.",
        "difficulty": "beginner",
        "likes": 201,
        "featured": False,
        "created_at": datetime(2026, 8, 20, 7, 45, tzinfo=timezone.utc),
    },
    {
        "id": "p-07",
        "title": "Story Worldbuilder",
        "description": "Factions, maps and plot hooks for your fiction premise — all kept internally consistent.",
        "prompt": (
            "You are a worldbuilding consultant. My story idea: {premise}.\n"
            "Build:\n"
            "1. A one-paragraph world summary (setting, era, one unique rule).\n"
            "2. Three factions, each with a goal and a secret.\n"
            "3. A map of the central location with 5 notable places.\n"
            "4. Two plot hooks that exploit the unique rule.\n"
            "Keep everything consistent with the premise."
        ),
        "category": "creative",
        "tags": ["worldbuilding", "fiction", "story"],
        "author": "Kabir L.",
        "difficulty": "intermediate",
        "likes": 168,
        "featured": False,
        "created_at": datetime(2026, 8, 24, 16, 30, tzinfo=timezone.utc),
    },
    {
        "id": "p-08",
        "title": "Email Reply Assistant",
        "description": "Polish any email draft into a clear, professional reply under 120 words.",
        "prompt": (
            "Rewrite my email reply to be clearer and more professional.\n"
            "Context: {who, what happened, what I want}\n"
            "My draft: {draft}\n"
            "Return:\n"
            "- A polished version (≤120 words)\n"
            "- A one-line subject\n"
            "- One thing I am missing from the reply"
        ),
        "category": "general",
        "tags": ["email", "communication", "writing"],
        "author": "Nikhil A.",
        "difficulty": "beginner",
        "likes": 233,
        "featured": False,
        "created_at": datetime(2026, 8, 27, 13, 15, tzinfo=timezone.utc),
    },
    {
        "id": "p-09",
        "title": "Regex Explainer",
        "description": "Any regex, broken down part by part with match examples and edge cases.",
        "prompt": (
            "Explain this regular expression to a junior developer: {regex}\n"
            "- Break it down part by part in a table.\n"
            "- Show 3 strings it matches and 3 it does not.\n"
            "- Rewrite it in a simpler form if possible.\n"
            "- Give one edge case it fails on."
        ),
        "category": "coding",
        "tags": ["regex", "explainer", "tutorial"],
        "author": "Aarav S.",
        "difficulty": "intermediate",
        "likes": 121,
        "featured": False,
        "created_at": datetime(2026, 9, 2, 10, 10, tzinfo=timezone.utc),
    },
    {
        "id": "p-10",
        "title": "Interview Question Generator",
        "description": "A complete 30-minute interview kit: warm-ups, core questions, puzzle task and a closer.",
        "prompt": (
            "Generate a 30-minute interview question set for: {role} at {seniority} level.\n"
            "Structure:\n"
            "- 2 warm-up questions (behavioral)\n"
            "- 4 core technical/domain questions with what a good answer includes\n"
            "- 1 whiteboard/puzzle task with a 10-minute timebox\n"
            "- 1 question I should ask the candidate"
        ),
        "category": "education",
        "tags": ["interview", "hiring", "questions"],
        "author": "Sana P.",
        "difficulty": "beginner",
        "likes": 187,
        "featured": False,
        "created_at": datetime(2026, 9, 5, 19, 0, tzinfo=timezone.utc),
    },
    {
        "id": "p-11",
        "title": "Product Name Brainstormer",
        "description": "20 speakable, brandable names for your product — with a ranked top 5.",
        "prompt": (
            "Brainstorm 20 names for my product: {one-line description}.\n"
            "Constraints:\n"
            "- ≤2 words, easy to say, no numbers\n"
            "- The name should read well on a T-shirt and in an app icon\n"
            "- Flag any name that sounds like an existing brand\n"
            "Rank your top 5 and explain each in one sentence."
        ),
        "category": "creative",
        "tags": ["branding", "names", "brainstorm"],
        "author": "Meera K.",
        "difficulty": "beginner",
        "likes": 142,
        "featured": False,
        "created_at": datetime(2026, 9, 8, 12, 25, tzinfo=timezone.utc),
    },
    {
        "id": "p-12",
        "title": "Meeting Summarizer",
        "description": "Notes in, decisions out: summary, decision list, open questions and a send-ready email.",
        "prompt": (
            "Turn the meeting notes below into:\n"
            "1. A 3-sentence summary.\n"
            "2. A decision list (decision + owner + deadline if known).\n"
            "3. Open questions that need follow-up.\n"
            "4. A ready-to-send email to attendees.\n"
            "Notes: {notes}"
        ),
        "category": "productivity",
        "tags": ["meetings", "summary", "notes"],
        "author": "Ishita R.",
        "difficulty": "beginner",
        "likes": 198,
        "featured": False,
        "created_at": datetime(2026, 9, 11, 9, 0, tzinfo=timezone.utc),
    },
]



def seed() -> None:
    """Confirm the sample prompts are available in memory."""
    print(f"Ready: {len(PROMPTS)} sample prompts. No database required.")


if __name__ == "__main__":
    seed()
