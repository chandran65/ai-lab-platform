"""
Mindora Platform — Seed Data Script.

Populates the database with:
  - 4 learning worlds (Discovery Island, Coding Forest, AI Explorer Lab, Innovation Lab)
  - 20 experiments (Activities) linked to their respective worlds
  - Badge definitions
  - Achievement definitions
  - Skill definitions

Idempotent: safe to run multiple times — skips if worlds already exist.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

from sqlalchemy import delete

from app.core.database import async_session_factory, engine
from app.models import Base
from app.models.activity import Activity
from app.models.badge import Badge
from app.models.achievement import Achievement
from app.models.skill import Skill
from app.models.world import World

# ── World Definitions ─────────────────────────────────────────────

WORLD_DATA: list[dict[str, Any]] = [
    {
        "name": "Discovery Island",
        "slug": "discovery-island",
        "subtitle": "Where curiosity takes flight",
        "description": "Welcome to Discovery Island! Join Robo Bunny on a magical journey where you'll learn to observe, sort, and recognize patterns — the very same skills that power artificial intelligence! Every activity is a playful adventure designed for little explorers.",
        "theme": "Animal Kingdom",
        "mascot_name": "Robo Bunny",
        "mascot_emoji": "🐰",
        "mascot_personality": "A friendly, curious robot bunny who loves to explore and ask 'why?'",
        "min_age": 4,
        "max_age": 6,
        "order": 0,
        "skills": json.dumps(["Observation", "Pattern Recognition", "Sequencing", "Categorization", "Basic Logic"]),
        "gradient": "from-pink-400 via-rose-300 to-orange-200",
        "accent_color": "#f43f5e",
        "completion_reward": "Junior Explorer Badge",
        "is_active": True,
        "entry_requirements": json.dumps({}),
    },
    {
        "name": "Coding Forest",
        "slug": "coding-forest",
        "subtitle": "Speak the language of computers",
        "description": "Welcome to the Coding Forest, where Code Fox will teach you how computers think! You'll learn algorithms, loops, and decision-making through exciting adventures. Every puzzle you solve makes you a better programmer!",
        "theme": "Adventure Forest",
        "mascot_name": "Code Fox",
        "mascot_emoji": "🦊",
        "mascot_personality": "A clever fox who loves logic puzzles and writing code with his tail!",
        "min_age": 7,
        "max_age": 9,
        "order": 1,
        "skills": json.dumps(["Sequencing", "Algorithms", "Loops", "Decisions", "Optimization"]),
        "gradient": "from-emerald-400 via-green-300 to-teal-200",
        "accent_color": "#10b981",
        "completion_reward": "Algorithm Apprentice Badge",
        "is_active": True,
        "entry_requirements": json.dumps({"required_world": "discovery-island"}),
    },
    {
        "name": "AI Explorer Lab",
        "slug": "ai-explorer-lab",
        "subtitle": "Build intelligent machines",
        "description": "Step into the AI Explorer Lab with Professor Nova! This is where you'll discover how machine learning works — from training data to predictions. Build real AI models and understand the science behind smart technology!",
        "theme": "Future Scientist",
        "mascot_name": "Professor Nova",
        "mascot_emoji": "🧪",
        "mascot_personality": "A brilliant scientist who makes AI fun with bubbling experiments and star-powered explanations!",
        "min_age": 10,
        "max_age": 13,
        "order": 2,
        "skills": json.dumps(["Data", "Classification", "Training", "Prediction", "Bias Awareness"]),
        "gradient": "from-violet-500 via-purple-400 to-indigo-300",
        "accent_color": "#8b5cf6",
        "completion_reward": "AI Scientist Badge",
        "is_active": True,
        "entry_requirements": json.dumps({"required_world": "coding-forest"}),
    },
    {
        "name": "Innovation Lab",
        "slug": "innovation-lab",
        "subtitle": "Create the future with AI",
        "description": "The Innovation Lab is where you become a real AI developer! Guided by Astra, you'll build powerful AI applications, explore cutting-edge technology, and create solutions that can change the world. This is where future innovators are made!",
        "theme": "Future Innovator",
        "mascot_name": "Astra",
        "mascot_emoji": "🚀",
        "mascot_personality": "A visionary AI astronaut who builds starship-grade AI and dreams of coding the future!",
        "min_age": 14,
        "max_age": 18,
        "order": 3,
        "skills": json.dumps(["Machine Learning", "Ethics", "Product Thinking", "Innovation", "Deployment"]),
        "gradient": "from-cyan-500 via-blue-500 to-sky-400",
        "accent_color": "#06b6d4",
        "completion_reward": "Innovation Laureate Badge",
        "is_active": True,
        "entry_requirements": json.dumps({"required_world": "ai-explorer-lab"}),
    },
]

# ── Experiment (Activity) Definitions ─────────────────────────────

EXPERIMENT_DATA: dict[str, list[dict[str, Any]]] = {
    "discovery-island": [
        {"id": "pattern-finder", "name": "Pattern Finder", "description": "Spot and complete colorful patterns in nature! Match stripes, spots, and shapes to train your observation skills.", "activity_type": "experiment", "grade_levels": json.dumps(["PK", "K"]), "difficulty": "beginner", "is_featured": True, "config_schema": json.dumps({"emoji": "🔍", "skills": ["Pattern Recognition", "Observation"], "levels": 5, "duration": "5 min", "game_link": None, "is_new": True})},
        {"id": "sort-the-toys", "name": "Sort The Toys", "description": "Help Robo Bunny organize the toy box by color, shape, and size. Sorting is how AI learns to categorize!", "activity_type": "experiment", "grade_levels": json.dumps(["PK", "K"]), "difficulty": "beginner", "is_featured": True, "config_schema": json.dumps({"emoji": "🧸", "skills": ["Categorization", "Observation"], "levels": 6, "duration": "5-8 min", "game_link": None, "is_new": True})},
        {"id": "emotion-detective", "name": "Emotion Detective", "description": "Look at friendly animal faces and guess how they're feeling. You'll learn how AI reads emotions!", "activity_type": "experiment", "grade_levels": json.dumps(["PK", "K"]), "difficulty": "beginner", "is_featured": False, "config_schema": json.dumps({"emoji": "😊", "skills": ["Observation", "Basic Logic"], "levels": 5, "duration": "5 min", "game_link": None, "is_new": True})},
        {"id": "story-builder", "name": "Story Builder", "description": "Put picture cards in the right order to tell a story. Sequencing is the first step to coding!", "activity_type": "experiment", "grade_levels": json.dumps(["PK", "K"]), "difficulty": "beginner", "is_featured": True, "config_schema": json.dumps({"emoji": "📖", "skills": ["Sequencing", "Basic Logic"], "levels": 6, "duration": "8-10 min", "game_link": None, "is_new": True})},
        {"id": "robot-path", "name": "Robot Path", "description": "Guide Robo Bunny through a simple maze using arrow cards. You're writing your first algorithm!", "activity_type": "experiment", "grade_levels": json.dumps(["PK", "K"]), "difficulty": "beginner", "is_featured": True, "config_schema": json.dumps({"emoji": "🤖", "skills": ["Sequencing", "Basic Logic"], "levels": 8, "duration": "5-10 min", "game_link": "/games/bee"})},
    ],
    "coding-forest": [
        {"id": "bee-algorithm", "name": "Bee Algorithm Challenge", "description": "Program a bee's flight path to collect nectar from flowers. Avoid obstacles and find the shortest route!", "activity_type": "experiment", "grade_levels": json.dumps(["1", "2", "3"]), "difficulty": "beginner", "is_featured": True, "config_schema": json.dumps({"emoji": "🐝", "skills": ["Algorithms", "Sequencing", "Optimization"], "levels": 10, "duration": "5-10 min", "game_link": "/games/bee"})},
        {"id": "blockly-robot", "name": "Blockly Robot", "description": "Stack colorful coding blocks to make a robot move, turn, and dance. Visual programming made fun!", "activity_type": "experiment", "grade_levels": json.dumps(["1", "2", "3"]), "difficulty": "beginner", "is_featured": True, "config_schema": json.dumps({"emoji": "🧩", "skills": ["Sequencing", "Loops", "Decisions"], "levels": 8, "duration": "10-15 min", "game_link": "/block-editor"})},
        {"id": "treasure-logic", "name": "Treasure Logic", "description": "Follow the treasure map using if-then-else logic. Make the right choices to find the hidden gold!", "activity_type": "experiment", "grade_levels": json.dumps(["1", "2", "3"]), "difficulty": "intermediate", "is_featured": True, "config_schema": json.dumps({"emoji": "🗺️", "skills": ["Decisions", "Algorithms", "Optimization"], "levels": 6, "duration": "5-10 min", "game_link": "/games/turtle"})},
        {"id": "weather-predictor", "name": "Weather Predictor", "description": "Analyze clouds, wind, and temperature to predict the weather. Learn how AI makes predictions!", "activity_type": "experiment", "grade_levels": json.dumps(["1", "2", "3"]), "difficulty": "intermediate", "is_featured": True, "config_schema": json.dumps({"emoji": "🌤️", "skills": ["Pattern Recognition", "Decisions"], "levels": 10, "duration": "10-15 min", "game_link": "/games/weather"})},
        {"id": "character-builder", "name": "Character Builder", "description": "Design your own forest character by combining features. Mix and match to create unique creatures!", "activity_type": "experiment", "grade_levels": json.dumps(["1", "2", "3"]), "difficulty": "beginner", "is_featured": False, "config_schema": json.dumps({"emoji": "🎨", "skills": ["Creativity", "Categorization"], "levels": 5, "duration": "10 min", "game_link": None, "is_new": True})},
    ],
    "ai-explorer-lab": [
        {"id": "fruit-classifier", "name": "Fruit Classifier", "description": "Train an AI to tell apples from oranges! Upload pictures and watch your model learn to classify fruit.", "activity_type": "experiment", "grade_levels": json.dumps(["4", "5", "6", "7"]), "difficulty": "intermediate", "is_featured": True, "config_schema": json.dumps({"emoji": "🍎", "skills": ["Classification", "Data", "Training"], "levels": 5, "duration": "10-15 min", "game_link": "/ml-environment"})},
        {"id": "cats-vs-dogs", "name": "Cats vs Dogs Trainer", "description": "Build a neural network that can tell cats apart from dogs. The classic AI training challenge!", "activity_type": "experiment", "grade_levels": json.dumps(["4", "5", "6", "7"]), "difficulty": "intermediate", "is_featured": True, "config_schema": json.dumps({"emoji": "🐱", "skills": ["Training", "Classification", "Data"], "levels": 6, "duration": "15 min", "game_link": "/ml-environment"})},
        {"id": "sound-detective", "name": "Sound Detective", "description": "Train an AI to recognize sounds — clapping, snapping, whistling. Your voice becomes the controller!", "activity_type": "experiment", "grade_levels": json.dumps(["4", "5", "6", "7"]), "difficulty": "intermediate", "is_featured": False, "config_schema": json.dumps({"emoji": "🔊", "skills": ["Training", "Data", "Prediction"], "levels": 5, "duration": "10 min", "game_link": "/ml-environment"})},
        {"id": "spam-detector", "name": "Spam Detector", "description": "Build a text classifier that spots spam messages. Learn how email filters keep your inbox safe!", "activity_type": "experiment", "grade_levels": json.dumps(["4", "5", "6", "7"]), "difficulty": "advanced", "is_featured": True, "config_schema": json.dumps({"emoji": "📧", "skills": ["Classification", "Prediction", "Bias Awareness"], "levels": 4, "duration": "10-15 min", "game_link": "/ml-environment"})},
        {"id": "ai-bias-lab", "name": "AI Bias Laboratory", "description": "Discover how biased data creates unfair AI. Learn to build ethical models that treat everyone fairly!", "activity_type": "experiment", "grade_levels": json.dumps(["4", "5", "6", "7"]), "difficulty": "advanced", "is_featured": True, "config_schema": json.dumps({"emoji": "⚖️", "skills": ["Bias Awareness", "Data", "Ethics"], "levels": 4, "duration": "15 min", "game_link": None, "is_new": True})},
    ],
    "innovation-lab": [
        {"id": "ai-builder", "name": "AI Builder", "description": "Design and train custom ML models for real-world problems. Choose architecture, tune parameters, and deploy!", "activity_type": "experiment", "grade_levels": json.dumps(["8", "9", "10", "11", "12"]), "difficulty": "advanced", "is_featured": True, "config_schema": json.dumps({"emoji": "🏗️", "skills": ["Machine Learning", "Innovation", "Deployment"], "levels": 8, "duration": "20-30 min", "game_link": "/ml-environment"})},
        {"id": "object-detection", "name": "Object Detection", "description": "Build a computer vision model that detects objects in real-time through your webcam. See AI see!", "activity_type": "experiment", "grade_levels": json.dumps(["8", "9", "10", "11", "12"]), "difficulty": "advanced", "is_featured": True, "config_schema": json.dumps({"emoji": "👁️", "skills": ["Machine Learning", "Innovation"], "levels": 6, "duration": "15-20 min", "game_link": "/ml-environment"})},
        {"id": "ai-ethics-sim", "name": "AI Ethics Simulator", "description": "Navigate ethical dilemmas in AI development. Make tough choices about privacy, fairness, and safety.", "activity_type": "experiment", "grade_levels": json.dumps(["8", "9", "10", "11", "12"]), "difficulty": "advanced", "is_featured": True, "config_schema": json.dumps({"emoji": "🧭", "skills": ["Ethics", "Product Thinking"], "levels": 5, "duration": "15-20 min", "game_link": None, "is_new": True})},
        {"id": "chatbot-builder", "name": "Chatbot Builder", "description": "Create your own intelligent chatbot that can answer questions, tell jokes, and have real conversations!", "activity_type": "experiment", "grade_levels": json.dumps(["8", "9", "10", "11", "12"]), "difficulty": "advanced", "is_featured": True, "config_schema": json.dumps({"emoji": "💬", "skills": ["Machine Learning", "Product Thinking", "Innovation"], "levels": 6, "duration": "20-25 min", "game_link": None, "is_new": True})},
        {"id": "ai-for-society", "name": "AI For Society Challenge", "description": "Design an AI solution to solve a real-world problem — climate change, healthcare, or education. Present your idea!", "activity_type": "experiment", "grade_levels": json.dumps(["8", "9", "10", "11", "12"]), "difficulty": "advanced", "is_featured": True, "config_schema": json.dumps({"emoji": "🌍", "skills": ["Innovation", "Ethics", "Product Thinking", "Deployment"], "levels": 4, "duration": "30 min", "game_link": None, "is_new": True})},
    ],
}

# ── Badge Definitions ─────────────────────────────────────────────

BADGE_DATA: list[dict[str, Any]] = [
    {"badge_id": "junior-explorer", "name": "Junior Explorer", "description": "Completed all experiments on Discovery Island! You've mastered the basics of observation and pattern recognition.", "icon": "🎖️", "skill": "observation", "stage": 1, "criteria": json.dumps({"required_world": "discovery-island", "experiments_completed": 5})},
    {"badge_id": "algorithm-apprentice", "name": "Algorithm Apprentice", "description": "Completed all experiments in Coding Forest! You can now think like a programmer and solve problems with logic.", "icon": "🎖️", "skill": "algorithms", "stage": 1, "criteria": json.dumps({"required_world": "coding-forest", "experiments_completed": 5})},
    {"badge_id": "ai-scientist", "name": "AI Scientist", "description": "Completed all experiments in the AI Explorer Lab! You understand machine learning, data classification, and ethical AI.", "icon": "🎖️", "skill": "machine-learning", "stage": 1, "criteria": json.dumps({"required_world": "ai-explorer-lab", "experiments_completed": 5})},
    {"badge_id": "innovation-laureate", "name": "Innovation Laureate", "description": "Completed all experiments in the Innovation Lab! You have the skills to build AI solutions for real-world problems.", "icon": "🏆", "skill": "innovation", "stage": 1, "criteria": json.dumps({"required_world": "innovation-lab", "experiments_completed": 5})},
]

# ── Achievement Definitions ───────────────────────────────────────

ACHIEVEMENT_DATA: list[dict[str, Any]] = [
    {"achievement_id": "first-pattern", "name": "First Pattern", "description": "Complete your first pattern matching experiment.", "icon": "🔍", "category": "sharpness"},
    {"achievement_id": "sorting-pro", "name": "Sorting Pro", "description": "Sort 50 items correctly across all sorting experiments.", "icon": "🧸", "category": "thinker"},
    {"achievement_id": "loop-master", "name": "Loop Master", "description": "Use loops in 10 different coding challenges.", "icon": "🔄", "category": "sharpness"},
    {"achievement_id": "debugger", "name": "Debugger", "description": "Fix 15 incorrect code sequences.", "icon": "🐛", "category": "patient"},
    {"achievement_id": "data-collector", "name": "Data Collector", "description": "Label 100 training data samples correctly.", "icon": "📊", "category": "consistent"},
    {"achievement_id": "model-trainer", "name": "Model Trainer", "description": "Train 5 AI models to over 90% accuracy.", "icon": "🧠", "category": "thinker"},
    {"achievement_id": "ethics-champion", "name": "Ethics Champion", "description": "Identify 10 biased data sets and correct them.", "icon": "⚖️", "category": "thinker"},
    {"achievement_id": "innovation-award", "name": "Innovation Award", "description": "Present an AI solution to a real-world problem.", "icon": "🏆", "category": "consistent"},
]

# ── Skill Definitions ─────────────────────────────────────────────

SKILL_DEFINITIONS: list[dict[str, Any]] = [
    {"skill_id": "observation", "name": "Observation", "default_score": 0.0, "default_level": "Curious Rookie"},
    {"skill_id": "pattern-recognition", "name": "Pattern Recognition", "default_score": 0.0, "default_level": "Pattern Spotter"},
    {"skill_id": "sequencing", "name": "Sequencing", "default_score": 0.0, "default_level": "Sequential Thinker"},
    {"skill_id": "categorization", "name": "Categorization", "default_score": 0.0, "default_level": "Organizer"},
    {"skill_id": "algorithms", "name": "Algorithms", "default_score": 0.0, "default_level": "Algorithm Apprentice"},
    {"skill_id": "loops", "name": "Loops", "default_score": 0.0, "default_level": "Loop Learner"},
    {"skill_id": "decisions", "name": "Decisions", "default_score": 0.0, "default_level": "Decision Maker"},
    {"skill_id": "optimization", "name": "Optimization", "default_score": 0.0, "default_level": "Optimizer"},
    {"skill_id": "classification", "name": "Classification", "default_score": 0.0, "default_level": "Classifier"},
    {"skill_id": "training", "name": "Training", "default_score": 0.0, "default_level": "Trainer"},
    {"skill_id": "prediction", "name": "Prediction", "default_score": 0.0, "default_level": "Predictor"},
    {"skill_id": "bias-awareness", "name": "Bias Awareness", "default_score": 0.0, "default_level": "Fairness Advocate"},
    {"skill_id": "machine-learning", "name": "Machine Learning", "default_score": 0.0, "default_level": "ML Apprentice"},
    {"skill_id": "ethics", "name": "Ethics", "default_score": 0.0, "default_level": "Ethical Thinker"},
    {"skill_id": "innovation", "name": "Innovation", "default_score": 0.0, "default_level": "Innovator"},
    {"skill_id": "deployment", "name": "Deployment", "default_score": 0.0, "default_level": "Deployer"},
]


# ═══════════════════════════════════════════════════════════════════
#  Seed Logic
# ═══════════════════════════════════════════════════════════════════

async def seed_database(*, force: bool = False) -> dict[str, int]:
    """Seed the database with worlds, experiments, badges, and achievements."""
    counts: dict[str, int] = {}

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        existing = await session.get(World, "discovery-island")
        if existing and not force:
            print("  [OK] Worlds already seeded. Use --force to re-seed.")
            return await _count_existing(session)

        if force:
            print("  [Seed] Force mode: re-seeding all data...")
            for table in [Activity, World]:
                await session.execute(delete(table))

        # ── 1. Seed Worlds ────────────────────────────────────────
        world_count = 0
        for w in WORLD_DATA:
            existing_world = await session.get(World, w["slug"])
            if existing_world and not force:
                continue
            world = World(
                id=w["slug"],
                name=w["name"],
                slug=w["slug"],
                subtitle=w.get("subtitle"),
                description=w["description"],
                theme=w["theme"],
                mascot_name=w["mascot_name"],
                mascot_emoji=w["mascot_emoji"],
                mascot_personality=w.get("mascot_personality"),
                min_age=w["min_age"],
                max_age=w["max_age"],
                order=w["order"],
                skills=w.get("skills", "[]"),
                gradient=w.get("gradient"),
                accent_color=w.get("accent_color"),
                completion_reward=w.get("completion_reward"),
                is_active=w["is_active"],
                entry_requirements=w["entry_requirements"],
            )
            session.add(world)
            world_count += 1
            print(f"  [OK] World: {w['name']}")

        counts["worlds"] = world_count
        await session.flush()

        # ── 2. Seed Experiments (Activities) ──────────────────────
        experiment_count = 0
        for world_slug, experiments in EXPERIMENT_DATA.items():
            for ex in experiments:
                existing_act = await session.get(Activity, ex["id"])
                if existing_act and not force:
                    continue
                activity = Activity(
                    id=ex["id"],
                    name=ex["name"],
                    description=ex["description"],
                    activity_type=ex["activity_type"],
                    grade_levels=ex["grade_levels"],
                    difficulty=ex["difficulty"],
                    is_featured=ex["is_featured"],
                    is_public=True,
                    config_schema=ex["config_schema"],
                    world_id=world_slug,
                )
                session.add(activity)
                experiment_count += 1
                print(f"  [OK] Experiment: {ex['name']} ({world_slug})")

        counts["experiments"] = experiment_count
        counts["badges"] = len(BADGE_DATA)
        counts["achievements"] = len(ACHIEVEMENT_DATA)
        counts["skill_defs"] = len(SKILL_DEFINITIONS)

        print(f"  [OK] {counts['badges']} badge definitions")
        print(f"  [OK] {counts['achievements']} achievement definitions")
        print(f"  [OK] {counts['skill_defs']} skill definitions")

        await session.commit()
        print(f"  [OK] Seed complete: {counts}")
        return counts


async def _count_existing(session) -> dict[str, int]:
    """Count existing records without modifying anything."""
    from sqlalchemy import func, select

    world_count = (await session.execute(select(func.count()).select_from(World))).scalar() or 0
    experiment_count = (await session.execute(select(func.count()).select_from(Activity))).scalar() or 0

    return {
        "worlds": world_count,
        "experiments": experiment_count,
        "badges": len(BADGE_DATA),
        "achievements": len(ACHIEVEMENT_DATA),
        "skill_defs": len(SKILL_DEFINITIONS),
    }


async def seed_demo_progress(user_id: str) -> None:
    """Seed demo progress for a specific user."""
    from datetime import datetime
    async with async_session_factory() as session:
        now = datetime.utcnow().isoformat()

        starting_skills = ["observation", "pattern-recognition", "sequencing", "categorization"]
        skill_defs_map = {s["skill_id"]: s for s in SKILL_DEFINITIONS}
        for skill_id in starting_skills:
            if skill_id in skill_defs_map:
                sd = skill_defs_map[skill_id]
                existing = await session.get(Skill, (user_id, skill_id))
                if not existing:
                    skill = Skill(
                        user_id=user_id,
                        skill_id=skill_id,
                        name=sd["name"],
                        score=10.0,
                        level=sd["default_level"],
                        updated_at=now,
                    )
                    session.add(skill)

        existing_ach = await session.get(Achievement, (user_id, "first-pattern"))
        if not existing_ach:
            ach = Achievement(
                user_id=user_id,
                achievement_id="first-pattern",
                name="First Pattern",
                description="Complete your first pattern matching experiment.",
                icon="🔍",
                category="sharpness",
                unlocked=True,
                unlocked_at=now,
            )
            session.add(ach)

        print(f"  [OK] Demo progress seeded for user {user_id}")
        await session.commit()


# ═══════════════════════════════════════════════════════════════════
#  Standalone Entry Point
# ═══════════════════════════════════════════════════════════════════

async def main() -> None:
    """CLI entry point for standalone usage."""
    import argparse

    parser = argparse.ArgumentParser(description="Seed Mindora database")
    parser.add_argument("--force", action="store_true", help="Re-seed even if data exists")
    parser.add_argument("--demo-user", type=str, help="Also seed demo progress for a user ID")
    args = parser.parse_args()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("[Seed] Seeding Mindora database...\n")
    counts = await seed_database(force=args.force)

    if args.demo_user:
        print(f"\n[User] Seeding demo progress for user: {args.demo_user}")
        await seed_demo_progress(args.demo_user)

    print("\nDone!")
    total = sum(counts.values())
    print(f"[Stats] Total records: {total}")


if __name__ == "__main__":
    asyncio.run(main())
