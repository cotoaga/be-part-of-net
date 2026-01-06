# be-part-of.net User Manual

**The Anti-Social Social Network**

---

## What Is This?

be-part-of.net is a consciousness network. It's your network, made visible.

You know people. Those people know people. You work on projects. Those projects connect you to others. You get introduced. Networks overlap. Opportunities emerge from knowing who knows whom.

**This network already exists.** It's just invisible—trapped in email threads, spreadsheets, LinkedIn profiles you never check, "I know someone who..." conversations at coffee shops.

**be-part-of.net makes it visible.** Nothing more, nothing less.

No posts. No likes. No engagement metrics. No algorithmic feed trying to keep you scrolling.

Just: **Who you are. Who you know. What you're working on.**

That's it. That's the product.

---

## Why This Exists

### The Problem

You're looking to solve a problem. You need a designer. You need funding. You need someone who knows Rust.

**You probably already know someone.** Or you know someone who knows someone.

But that knowledge is locked away:
- Buried in your email contacts
- Hidden in a CRM you never update
- Lost in a LinkedIn profile you visited once
- Living only in your memory ("Wait, didn't Alice mention she knows someone in Berlin?")

The network exists. You just can't see it.

### The Solution

**Visualize the network.** Make it tangible. Make it explorable.

When you need something, you don't scroll through contacts alphabetically. You **see** your network as a living graph. You **explore** the connections. You **discover** paths you didn't know existed.

"Oh, I didn't realize Bob and Carol both work on that URL. Let me reach out."

"Wait, Dave invited Eddie, and Eddie knows someone who... there's the connection."

### What We're Not

- **Not LinkedIn.** No job posts. No thought leadership. No connection requests from recruiters.
- **Not Facebook.** No baby photos. No political arguments. No algorithmic timeline.
- **Not a CRM.** No sales pipelines. No deal stages. No follow-up reminders.
- **Not a project manager.** No tasks. No sprints. No Gantt charts.

**We are:** The map of your consciousness network. The graph of who you know and what connects you.

Everything else—the actual work, the actual relationships, the actual projects—happens elsewhere. This is just the map.

---

## Core Concepts

### Three Types of Nodes

**1. People** 👤 (Blue spheres)
- A human being
- Has a name and email
- Can know other people
- Can create and collaborate on projects

**2. URLs** 🌐 (Orange spheres)
- A web resource
- A website, a GitHub repo, a Google Doc, a Figma file
- The **gravity center** of collaboration
- What brings people together

**3. MCP Servers** 🤖 (Purple spheres)
- Model Context Protocol servers
- AI agents that collaborate with humans
- Same as URLs, but for AI

### Four Types of Connections

**1. Invited** (Strongest)
- You invited someone into the network
- Permanent provenance—can't be deleted
- "I brought this person in"

**2. Created** (Strong)
- You created a URL or MCP resource
- Permanent provenance—can't be deleted
- "This is mine, I made it"

**3. Collaborates On** (Medium)
- You're actively working on a project/resource
- Can be removed (projects end, collaboration stops)
- "I'm part of this"

**4. Knowing** (Weak)
- You casually know someone
- No project connecting you (yet)
- Can be removed (people drift apart)
- "We've met, we're acquaintances"

### The Root: Where It All Starts

Every network has a **root node** (golden sphere with a ring).

This is the person who started the network. The origin. Everyone else was invited by someone, creating an invitation tree.

The root is **you** (or whoever created this network instance).

---

## Getting Started

### 1. Log In

Visit the network. Sign in with your email.

You'll see the 3D graph. If this is your first time, you might see a test network (Kurt → Alice → Bob, etc.). This is just example data.

### 2. Reset to Your Network

Click **"Reset Network"** to clear the example data and start fresh.

Or keep it—it's useful to explore how things work.

### 3. The Interface

**Center of screen:** 3D force-directed graph
- Nodes = people, URLs, MCPs
- Lines = connections between them
- **Click and drag** to rotate the view
- **Scroll** to zoom in/out
- **Click a node** to focus on it

**Top right:** Your name, theme toggle, sign out

**Bottom:** Action bar with buttons:
- **Reset Network** - Clear everything, start over
- **Recenter View** - Jump back to the centered node
- **Create** - Make a new URL/MCP resource
- **Invite** - Bring someone new into the network
- **Connect** - Draw a connection between two nodes
- **Use** - Collaborate on an existing project

**Right side panels:** Context-sensitive info about selected nodes

### 4. The Camera

The camera **focuses on one node at a time** (the "centered node").

- Click any node → camera smoothly moves to center on it
- The graph **fades with distance** (fog of war)
  - 0-1 hops: Full visibility
  - 2 hops: 70% opacity
  - 3 hops: 40% opacity
  - 4+ hops: Hidden

This keeps you focused on what's relevant to the current node.

**Why?** Because networks are overwhelming. You don't need to see 500 nodes at once. You need to see **this person's immediate network**, then explore outward.

---

## Using the Network

### Inviting Someone New

You meet someone. You want them in your network.

1. **Select yourself** (or whoever is inviting them)
2. Click **"Invite Person"**
3. Enter:
   - Their name
   - Their email
   - Optional description
4. Click **"Invite Person"**

**What happens:**
- A new person node appears
- An "invited" edge connects you to them (permanent)
- The camera centers on the new person

**Note:** Right now, invitations are immediate. In the future, they'll need to accept first.

### Creating a Project

You start a new project. A website, a GitHub repo, a shared document.

1. **Select yourself**
2. Click **"Create"**
3. Enter:
   - Resource type (URL or MCP)
   - Name
   - The actual URL
   - Optional description
4. Click **"Create Resource"**

**What happens:**
- A new URL/MCP node appears
- A "created" edge connects you to it (permanent—you're the creator)
- A "collaborates_on" edge connects you to it (you're also a collaborator)
- The camera centers on the new resource

**Why two edges?** Because creation is permanent provenance (you made it), but collaboration can end (you might stop working on it later).

### Marking a Casual Connection

You know someone, but you're not working on anything together. You just... know them.

1. Click **"Connect"**
2. Click the **first person** (you, probably)
3. Click the **second person** (them)
4. Select **"Knowing"** from the options
5. Click **"Create Connection"**

**What happens:**
- A "knowing" edge appears between you
- Weak connection, can be deleted later

### Collaborating on a Project

Someone else created a project. You want to join.

1. **Select yourself**
2. Click **"Collaborate"** (or "Use" in older versions)
3. Search for the URL/MCP resource
4. Click **"Collaborate"** on the one you want

**What happens:**
- A "collaborates_on" edge connects you to the resource
- Now you're visible as a collaborator when someone looks at that project

### Discovering Connections

This is where it gets interesting.

**Scenario:** You're looking at your network. You click on Alice (a friend).

You see:
- Alice knows Bob (you didn't realize this)
- Alice and Bob both collaborate on "Project X"
- Carol also collaborates on "Project X"

**Insight:** "Oh, Alice and Bob are working together on this thing, and Carol is involved too. I should reach out to Carol—she might know something useful."

**This is the entire point of be-part-of.net.** These discoveries happen **visually**, not by scrolling through lists.

### Making Introductions

You realize two people in your network should meet.

**Current workflow:**
1. Find their email addresses in their node info
2. Send an email: "Hey Alice, meet Bob. Bob, meet Alice. You're both working on similar things."

**Future workflow:** (Not implemented yet)
- Built-in introduction system
- "Introduce Alice to Bob" button
- Both get notified, can accept/decline

### Exploring Outward

Start at your root node. Click around.

- Who invited whom?
- Who's working on what?
- Who knows whom through which projects?

The 3D graph makes these relationships **spatial**. Your brain is good at spatial memory. Use it.

**Tip:** Use the "fog of war" to stay focused. If you can't see a node, it's too far away to be relevant right now. Click closer nodes to explore in that direction.

---

## The Graph Physics

The graph uses **force-directed layout**:
- **Nodes repel** each other (like magnets)
- **Edges pull** connected nodes together (like springs)
- The system finds equilibrium

**What this means:**
- Tightly connected clusters naturally group together
- Isolated nodes drift to the edges
- The structure **emerges organically** from the connections

You can also **drag nodes** around manually:
- Click and drag a node
- Physics pauses while you're dragging
- Release to let physics resume

---

## Understanding Edge Strength

Not all connections are equal.

### Permanent Edges (Can't Delete)

**Invited:**
- "I brought this person into the network"
- Permanent record of provenance
- Even if you stop talking to them, the history remains

**Created:**
- "I made this resource"
- Permanent record of authorship
- Even if you stop working on it, you're still the creator

### Removable Edges (Can Delete)

**Collaborates On:**
- "I'm currently working on this"
- Projects end, collaboration stops
- You can remove yourself from old projects

**Knowing:**
- "I casually know this person"
- Weakest connection
- People drift apart, networks change

**Why this hierarchy?**

Because networks have **history** and **current state**.

- History = invited, created (what happened)
- Current state = collaborates_on, knowing (what's happening now)

You can't change history, but you can change the present.

---

## The Inspector Panel

Click any node → Inspector Panel opens on the right.

**For People:**
- Name, email, description
- Who invited them (provenance)
- What they created
- What they collaborate on
- Who they know

**For URLs/MCPs:**
- Name, URL, description
- Who created it (provenance)
- Who collaborates on it
- Option to visit the URL

**Actions:**
- **Edit** - Change name/description
- **Delete** - Remove node (only for URLs/MCPs you created, and only if no one else is using them)
- **Connect** - Start connecting this node to another

---

## Project-Centric View

The genius of using URLs as nodes:

**Click a URL node.** You instantly see:
- Who created it
- Everyone collaborating on it
- How those people connect to each other

This is the **project view**. The URL is the gravity center.

**Example:** Click "bepartof.net GitHub Repo"

You see:
- Alice created it
- Bob collaborates on it
- Carol collaborates on it
- Bob and Carol know each other (but how?)
- Click Carol → she was invited by Dave
- Click Dave → he was invited by Alice

**Insight:** Alice brought in Dave, Dave brought in Carol, Carol met Bob, now they're all working on the repo together.

**This is the network story.** You can't see this in a spreadsheet.

---

## Debug Overlay (Optional)

There's a debug panel in the top-right showing system state:

- Current mode (spin/zoom, drag node, animating)
- Camera state
- Physics running/paused
- Node/edge counts
- Centered node name

**Plus:** Sliders to control:
- Node size (1x - 4x, default 2x)
- Label size (1x - 4x, default 2x)
- Spring force (0.001 - 0.1, default 0.01)
- Camera FOV (30° - 120°, default 75°)

Play with these to find your preferred visual style.

---

## What Happens Elsewhere

be-part-of.net is **just the map**. The actual work happens in other tools:

### Communication
- Email, Slack, Discord, phone calls
- be-part-of.net tells you **who to reach out to**
- The actual conversation happens elsewhere

### Project Work
- GitHub, Google Docs, Figma, Notion
- be-part-of.net tells you **who's working on what**
- The actual work happens at the URL

### Relationship Building
- Coffee meetings, Zoom calls, conferences
- be-part-of.net tells you **who knows whom**
- The actual relationship happens in real life

### Calendar & Tasks
- Google Calendar, Todoist, Linear
- be-part-of.net tells you **what projects exist**
- The actual scheduling happens elsewhere

**We are the glue. We show you the connections. Everything else is someone else's job.**

---

## Workflows & Use Cases

### Use Case 1: The Introduction

**Situation:** You need a designer.

**Workflow:**
1. Look at your network
2. Click around—who knows designers?
3. See that Alice collaborates on "Design System" project
4. Click the "Design System" node
5. See that Bob and Carol also work on it
6. Click Carol—you don't know her, but Alice does
7. Email Alice: "Hey, can you intro me to Carol? I need design help."

**Result:** Introduction made, problem solved.

### Use Case 2: The Discovery

**Situation:** You're working on a climate tech project.

**Workflow:**
1. Create the URL node for your project
2. Mark yourself as "collaborates_on" it
3. Browse your network
4. Notice Dave collaborates on "Carbon Offset Calculator"
5. Click that project—see who else is working on it
6. Find Eddie, who you didn't know
7. Reach out: "Hey Dave, I see Eddie is working on carbon stuff too. Can you intro us?"

**Result:** New collaboration potential discovered.

### Use Case 3: The Onboarding

**Situation:** New team member joins your project.

**Workflow:**
1. Invite them to the network
2. Add them as "collaborates_on" your project URL
3. They can now see the full team
4. They click around to understand who does what
5. They see Bob and Carol both work on "Backend API"
6. They know who to ask about backend questions

**Result:** Faster onboarding through visible structure.

### Use Case 4: The Network Map

**Situation:** You're a community organizer. You want to understand your community structure.

**Workflow:**
1. Invite all community members
2. Add projects/resources as URLs
3. Mark who collaborates on what
4. Step back and look at the graph
5. See clusters form naturally
6. Identify connectors (people bridging multiple clusters)
7. Identify isolated people (need more integration)

**Result:** Community health visible at a glance.

---

## Tips & Best Practices

### Keep It Current

The network is only useful if it's up-to-date.

- **Add people** when you meet them (even casually)
- **Add projects** when they start
- **Remove "collaborates_on"** edges when projects end
- **Don't worry** about removing "knowing" edges—leave them unless the relationship truly ends

### Use Real URLs

When you add a URL node, use the **actual URL**:
- Not "My Website"—use "https://example.com"
- Not "GitHub Repo"—use "https://github.com/user/repo"
- Not "Design File"—use "https://figma.com/file/..."

**Why?** So you can click through. The URL node is a **portal** to the actual work.

### Be Honest About Connections

Don't inflate your network.

- **Only add people you actually know.** Not "I met them once at a conference 5 years ago."
- **Only mark "collaborates_on" if you're actually contributing.** Not "I starred their GitHub repo."
- **Use "knowing" for casual connections.** It's okay to have weak ties. That's what "knowing" is for.

**The value is in accuracy, not size.**

### Explore Before You Ask

Before reaching out for an introduction:
- Click around the network
- Understand the path between you and the person
- See if there's a shared project connecting you
- Check if you have multiple paths (stronger introduction)

**Context matters.** "Alice, can you intro me to Bob?" is weak. "Alice, I see you and Bob both work on Project X—can you intro me?" is strong.

### Let the Graph Tell Stories

When someone asks "How do you know Carol?"

Don't say "Through Alice."

Say "Alice invited me, I met Dave through Alice, Dave brought in Carol, Carol and I both work on the API project."

**The network has depth.** Share the path, not just the endpoint.

---

## Privacy & Security

### What's Public vs Private

**Public (visible to everyone in the network):**
- Your name
- Your email
- Who you know
- What you work on
- Who invited you

**Private (not stored):**
- Passwords (hashed, never readable)
- Messages (not a messaging system)
- Calendar (not stored)
- Documents (just URLs pointing to them)

### Who Can See What

**Currently:** Everyone in the network can see the entire network.

**Future:** Planned privacy controls:
- Private connections (not visible to others)
- Hidden projects (not listed publicly)
- Invite-only sub-networks

### Deleting Things

**You can delete:**
- Weak edges you created ("knowing", "collaborates_on")
- URL/MCP nodes you created (if no one else uses them)
- Your entire account (removes you and all your created content)

**You can't delete:**
- Permanent provenance edges ("invited", "created")
- People nodes (even if you invited them—they're independent now)
- Nodes other people created

### Email Usage

Your email is used for:
- Login authentication
- Identification (so people can contact you)

Your email is **not** used for:
- Marketing (we don't send emails)
- Spam (we don't sell your data)
- Notifications (not implemented yet)

**If you want someone to contact you, they'll see your email. That's the point.**

---

## Technical Notes

### The 3D View

Built with React Three Fiber + Three.js.

- High-resolution sphere meshes (64x64 segments)
- PBR materials with metalness and reflections
- Real-time physics simulation
- Smooth camera animations
- Interactive node dragging

**Why 3D?** Because networks are inherently 3D. Forcing them into 2D creates artificial overlaps and occlusion. In 3D, you can rotate to see hidden connections.

### The Database

Supabase (PostgreSQL) with:
- Row Level Security (RLS) for permissions
- Real-time subscriptions (coming soon)
- Edge uniqueness constraints
- Automatic timestamps

**Schema:**
- `nodes` table (people, URLs, MCPs)
- `edges` table (connections)
- Relation type constraints enforced at DB level

### Performance

- Pre-computed stable layouts (no initial displacement)
- Force simulation runs at 60 FPS
- Fog-of-war culling (only render nearby nodes)
- Real-time edge updates during drag

**Scales to:** Hundreds of nodes comfortably. Thousands with optimization. (Not tested beyond that.)

---

## Future Features (Not Yet Implemented)

### Invitation Acceptance
- Invitations create "pending" state
- Invitee must accept before appearing in network
- Can decline invitations

### Collaborator Management
- Resource owners can add/remove collaborators
- "Invite to collaborate" button
- Team management from project view

### Real-Time Updates
- See changes as they happen (via Supabase subscriptions)
- Other users appear as cursors/avatars
- Live collaboration indicators

### Notification System
- "Alice invited you"
- "Bob added you to Project X"
- "Carol wants to connect"

### Search & Filter
- Search nodes by name
- Filter by type (people/URLs/MCPs)
- Filter by connection strength

### Privacy Controls
- Private connections (hidden from others)
- Invite-only sub-networks
- Connection request approval

### Export & Sharing
- Export network as JSON
- Share read-only view with non-members
- Generate network diagrams/reports

### Mobile App
- Touch-optimized 3D controls
- Native iOS/Android apps
- Same data, different interface

---

## Philosophy: Why the "Anti-Social Social Network"?

### Social Networks Are Broken

- **Facebook:** Optimized for engagement (= outrage)
- **Twitter:** Optimized for virality (= hot takes)
- **LinkedIn:** Optimized for personal branding (= performative professionalism)
- **Instagram:** Optimized for envy (= curated perfection)

**All of them:** Algorithmic feeds. Engagement metrics. Infinite scroll. Ads. Distraction.

**None of them:** Actually help you understand your network.

### What We Optimize For

**Not:** Time on site. Not engagement. Not virality. Not growth hacking.

**Yes:** Clarity. Understanding. Discovery. Utility.

**Goal:** You open be-part-of.net when you need to understand your network. You find what you need. You close it. You go back to real life.

**We succeed when you spend LESS time here, not more.**

### The Network Is Yours

This isn't a platform. It's a tool.

- **You own your data.** Export it anytime.
- **You control your network.** Add, remove, edit freely.
- **You decide what to share.** No forced public profiles.

**We're not trying to be the place where your network lives. We're the place where you understand it.**

---

## Troubleshooting

### "The graph looks chaotic!"

This is normal at first. Networks take time to stabilize.

**Solutions:**
- Wait 10-20 seconds for physics to settle
- Drag nodes manually to organize them
- Use the fog-of-war (center on one node, ignore the rest)
- Adjust spring force in the debug panel

### "I can't see a node I know exists"

It's probably hidden by fog-of-war (too many hops away).

**Solution:**
- Click nodes progressively closer to it
- Or center on the root node and work outward

### "I accidentally deleted something!"

**If it was a weak edge:** Recreate it with "Connect"

**If it was a strong edge:** You can't delete those (by design)

**If it was a node:** Can't be undone. You'll need to recreate it.

**Prevention:** Be careful with the delete button. There's no undo (yet).

### "The camera is stuck/weird"

**Solution:**
- Click "Recenter View" button
- Refresh the page
- Try dragging the view manually

### "Nodes are overlapping"

This happens with tightly connected clusters.

**Solutions:**
- Drag them apart manually
- Increase spring force (debug panel)
- Zoom in closer
- Rotate the view to see from a different angle

---

## Support & Feedback

### Questions?

- Check this manual first
- Check `CLAUDE.md` for technical details
- Open an issue on GitHub

### Feature Requests?

We're focused on simplicity. Most feature requests will be "no" by default.

**Ask yourself:**
- Does this make the network **more visible**?
- Or does it add complexity?

If it's the former, we're interested. If it's the latter, probably not.

### Bug Reports?

- Describe what you expected
- Describe what actually happened
- Include browser/device info
- Screenshots help

---

## Closing Thoughts

Networks are everything.

Your career opportunities come from networks.
Your collaborations come from networks.
Your learning comes from networks.
Your community comes from networks.

**But networks are invisible.**

be-part-of.net makes them visible.

That's it. That's the whole idea.

No features. No bloat. No distractions.

Just: **Who you know. What you work on. How it all connects.**

Simple. Focused. Useful.

Welcome to the anti-social social network.

---

**Version:** 0.2.1
**Last Updated:** January 6, 2026
**Maintained by:** kydroon

For technical documentation, see `CLAUDE.md`
For development setup, see `README.md`
