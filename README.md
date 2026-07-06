# Korea Food Guide — CIEE Restaurant App

A restaurant guide app built to help CIEE Korea program students find good, budget-friendly meals near their hotels — based on original research and an Excel database I compiled myself through in-person restaurant visits.

**Live Demo:** https://lunashimca-crypto.github.io/restaurant-app-ciee/#/

![status](https://img.shields.io/badge/status-active-brightgreen)
![vite](https://img.shields.io/badge/build-vite-646CFF)

---

## Why This Project

CIEE Korea students are international visitors working with a limited daily food budget (~10,000 KRW), often unfamiliar with the area around their hotel and unsure what's actually good or affordable. Menus in Korean, unfamiliar food categories, and no easy way to compare options nearby made simple things like "where do I eat tonight" surprisingly stressful for new students.

This app solves that by giving students a curated, hotel-specific restaurant list they can browse by cuisine type, price, and location — all pre-vetted so they know it's both within budget and worth eating at.

I led this project end to end, from research through deployment:

- **Field research** — personally visited restaurants near both partner hotels (Best Western Premier Seoul Garden and Somerset Palace) to confirm pricing was within student budget and that food quality was solid
- **Data collection & structuring** — built and maintained an Excel database of ~13 restaurants per hotel (~26 total), covering cuisine type, price/menu info, and location
- **Content design** — organized restaurants into clear categories so students can quickly filter by what they're in the mood for
- **AI-assisted development** — built the app using Claude (Anthropic) as a development partner: defined the requirements and app behavior, directed the code generation, edited in-app text and content directly in the codebase, and tested and deployed the final result

## Overview

The app presents a hotel-specific restaurant guide so students staying at either partner hotel can quickly find a place to eat that fits their budget and taste. Restaurants are organized by cuisine type and include pricing/menu info and location details.

The experience is designed to be:

- **Hotel-specific** — separate restaurant lists for each partner hotel, so students only see relevant, walkable options
- **Budget-aware** — every restaurant was field-checked to make sure it fits within the student meal budget
- **Easy to browse** — filterable by cuisine type (Korean, Western, etc.) instead of one long undifferentiated list

---

## Table of Contents

- [Why This Project](#why-this-project)
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Background](#background)
- [Credits](#credits)

---

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool & dev server
- JavaScript, HTML, CSS
- Excel — used to research, structure, and maintain the restaurant database that powers the app's content
- Built with [Claude](https://www.anthropic.com/claude) (Anthropic) as an AI development partner — code was generated and refined iteratively based on requirements and content I directed

## Key Features

- 🏨 Hotel-specific restaurant lists — separate guides for Best Western Premier Seoul Garden and Somerset Palace
- 🍜 ~13 field-vetted restaurants per hotel, organized by cuisine type (Korean, Western, and more)
- 💰 Pricing and menu info for every listed restaurant, chosen to fit within student meal budgets
- 📍 Location details so students can find each restaurant from their hotel
- ✅ Every restaurant personally visited and confirmed before being added to the list

## Screenshots

_(add screenshots of the hotel selection screen, a restaurant list, and a restaurant detail view)_

| Hotel Selection | Restaurant List | Restaurant Detail |
|:---:|:---:|:---:|
| <img width="732" height="1480" alt="image" src="https://github.com/user-attachments/assets/b1168931-da94-45f0-a25b-355af8f121ba" />| <img width="728" height="1474" alt="image" src="https://github.com/user-attachments/assets/57f2391f-9f0c-4d44-afab-5efba8e9af3d" />| <img width="732" height="1468" alt="image" src="https://github.com/user-attachments/assets/80fa41f4-ae6e-461f-aa48-f1ead1ec33d7" />|

## How It Works

1. **Choose a Hotel** — Students select their hotel (Best Western Premier Seoul Garden or Somerset Palace) to see restaurants within walking distance.
2. **Browse by Cuisine** — Restaurants are organized by cuisine type, so students can filter to what they're craving.
3. **Check Details** — Each listing includes price/menu info and location, so students can decide before they leave the hotel.
4. **Eat with Confidence** — Since every restaurant was field-checked in person, students know the option is both within budget and worth trying.

## Deployment

This app is deployed via **GitHub Pages** and is live at:
https://lunashimca-crypto.github.io/restaurant-app-ciee/#/

## Background

Built for the same CIEE Korea program that the [War Memorial Scavenger Hunt](#) app supports — this project addresses a different, everyday pain point: helping international students navigate food choices in an unfamiliar city on a fixed budget. The restaurant data was collected independently through direct site visits rather than pulled from an existing source, so the recommendations reflect real, first-hand vetting.

