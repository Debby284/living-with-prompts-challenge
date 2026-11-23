# Larkline Estates · Website plan (Prototype v2)

## Design direction
Calm and warm, inspired by the hotel references (Parkhotel Horst, Graaf ter Horst) without copying them: cream backgrounds, warm charcoal sections, the logo orange only as an accent. Serif headings (Newsreader) with a friendly sans body (Figtree). Street-level village photos instead of skyline or panorama. The site is personal: real agents, direct phone and WhatsApp, one agent per client. Sellers are the priority, so the main action everywhere is "Plan a free valuation".

## Sitemap
| Page | Type | Why |
| --- | --- | --- |
| Home | Page | Confirms the choice: who we are, how we sell, villages, homes, team, valuation, articles, contact. All in one scroll. |
| Property | Template | One design for every listing. Agent contact right next to the facts. Built in v1. |
| Homes for sale | Archive | All listings with filters (village, type, status). Next version. |
| Article | Template | For the three existing articles. Next version. |
| Valuation sent | Confirmation | Shown inline in v1; can become its own page for tracking. |

Team, contact and selling stay as sections on the home page, not separate pages.

## Home page structure (v2)
0. Header in two rows on top of the hero photo: email, phone, "New homes by WhatsApp", "Free valuation"; below that the menu.
1. Hero: village street photo, centred headline. A search bar (type, village, street, min and max price) overlaps the bottom of the photo.
2. Small on purpose: office photo with the story and three facts.
3. How can we help: four cards with orange line icons on a dark background (sell, buy, valuation, choose a village).
4. Villages: filter (by the Maas, countryside and the Peel, village centres) and a sideways scroller, each village with its agent.
5. Homes for sale: carousel that moves on its own and pauses on hover; cards with a big photo, three small photos, price and facts. Followed by a "Be the first to hear about new homes" WhatsApp banner.
6. Team: Claire's quote, four agents with Call, WhatsApp, Email.
7. Free valuation: review next to a two-step form; the request goes to the agent of the chosen village.
8. Articles, closing band, footer.

## Property template structure
1. Title, village and street, price, status, key facts.
2. Photo mosaic.
3. Description, features, details table, sticky agent card (Call, WhatsApp, email). Sticky contact bar on phones.
4. Living here: the street and the village.
5. More homes from the same agent, plus a quiet valuation card for nearby owners.

## Framework values
- Title scale: ratio 1.2 mobile, 1.3 desktop (title-1 48px to 77px).
- brand-1 #E86E14 (logo orange), brand-2 #B04E09 (buttons and text, 5.0:1 on cream).
- Radius: buttons 4px, s 4px, m 8px, l 16px.

## Open points for the client
- Real photos of the team, the office in Horst and each listing.
- Real client reviews (the one shown is a sample).
- Listing descriptions per home (placeholder text now).
- Backend for valuation requests so none get lost (CRM or form inbox with status), and per-agent editing of listings.

## Changes in Prototype v3

- **Header:** a warm orange bar (gradient from brand-2 to a deeper orange) with two rows: contact and buttons on top, the menu below. The logo sits in a light triangle that hangs over the hero, so the header clearly stands apart from the page.
- **Hero:** the text now sits on solid dark on the left, so it always reads well. On the right is a real photo of a brick house with a sale board. The board in the photo is covered by a Larkline board built in HTML/CSS (logo, "For sale", phone number). It stays exactly on the post at every screen size.
- **Honest note:** the board is a composite, not a real photo of a Larkline board. Before launch, replace it with a real photo of a Larkline sale board in front of a house in Horst.
- **Search bar:** moved from the hero to the end of the "Choose the village" section, right above the homes for sale.

## Changes in Prototype v4

- **Home cards:** both lines are now orange, and the price sits between them. Less empty space at the bottom of the card.
- **Header:** email and phone number removed from the header. They are now on the "For sale" board in the hero.
- **Hero:** new photo (the thatched brick house), darker, with a softer fade from the text side to the photo.
- **Mouse effect:** on a computer, the photo becomes lighter around the mouse pointer, also behind the text on the left. On iPad and phone there is no effect; the hero just stays still.
- **Board:** the Larkline board now stands on a post in the hedge. It is a drawn board on top of the photo, not a real photo. On phones the board is hidden, because there is no room next to the text.

## Changes in Prototype v5

- **Triangle motif:** the four "How can we help?" cards now end in a point at the bottom, like the logo notch in the header. Only there, nowhere else.
- **Board:** larger email address with a mail icon, phone number with a phone icon. Both are real links. On phones the board stays visible but shows only the icons (tap to mail or call).
- **Hedge:** the hedge at the bottom of the hero photo runs on into the next section and fades into the light background.
- **Dark backgrounds:** two variants to compare. A: fine cube lines. B: a warm orange glow with fine triangle lines. A small switch at the bottom left of the home page toggles between them. The switch is only for the prototype and goes away once a choice is made.
- **Team:** the five people (Claire plus the four agents) stand on a 3D ring that turns slowly. It pauses under the mouse, can be dragged, and the arrows step one person forward or back. Team photos are still placeholder stock photos.

## Changes in Prototype v6

- **Header notch:** the light triangle with the logo now has an orange frame.
- **Logo:** the orange line under the wordmark is a bit thicker, in both logo files, so it changes everywhere.
- **Dark backgrounds:** variant B (warm glow) is chosen. The triangles are now much larger, spaced apart and point down like the header notch. The cube variant and the A/B switch are gone.
- **Footer:** the logo sits on the left.

## Changes in Prototype v7

- **Home cards:** both orange lines now run the full width of the card. The icons for m², bedrooms and bathrooms are larger.
- **Dark backgrounds:** the triangles now connect into one continuous surface (a triangle grid), still large and subtle.
- **Header notch:** on page load the triangle rolls out downward in 3D, like a cloth hung out of a window, and settles with a small swing. Turned off for visitors who prefer less motion.
- **Hero:** where the mouse is, the dark shade disappears completely, so the photo shows clearly.
- **Back to top:** an orange triangle at the bottom right appears after the hero and scrolls back to the header.
- **Filter buttons:** village and homes filters have an orange border.

## Changes in Prototype v8

- **Header notch:** the triangle now starts rolled up like a sheet of paper and unrolls downward over about 3 seconds. The rolled-up part shows the back of the paper in header orange. Desktop only; on mobile the triangle is simply there. Turned off for visitors who prefer less motion.
- **Notch edge:** the border runs all around the triangle again, in exactly the header orange. In the header bar it melts away; it only shows on the tip over the dark hero.
- **Back to top:** the orange triangle has a white border, so it stays visible on dark sections.
- **Hero:** the mouse light spot works as in v7, and the dark gradient from left to right stays. New: on desktop the dark shade fades out toward the bottom of the photo, so the hedge runs light and clean into the next section. On phones the text sits low on the photo, so the shade stays there as in v7.
- **For sale board:** about 20% larger on all screens (desktop up to 20rem wide, phones 10rem). It stays visible on phones, top right in the hero.

## Changes in Prototype v9

- **For sale board:** the mail icon is larger and sits on top, the email address underneath in a larger size. On phones the board now also shows the address and phone number.
- **Header:** the "New homes by WhatsApp" button has the original green WhatsApp logo in a white circle before the text.
- **Visit us (section before the footer):** the photo is gone. The text stays on the left, with a new "Visit us" block (address, opening hours, route link). On the right is a 3D block map of Horst aan de Maas: the sixteen village names light up in orange one by one, then the camera tilts and flies to an orange pin at our office on Gasthuisstraat in Horst. "Play again" restarts it. Visitors who prefer less motion see the end state directly. The map is an illustration: village positions and the office pin are approximate, there are no real streets. Uses three.js from cdnjs.
- **Footer:** a dark fade at the top lets the map section melt into the footer. The logo moved to a new bottom row, on the left; on the right are social media icons (Facebook, Instagram, LinkedIn, YouTube, WhatsApp) with the legal lines under them. The social links are placeholders until Larkline has real accounts.

## Changes in Prototype v10

- **Header:** an orange divider line between the buttons and the menu. Once the header scrolls away, a slim bar with the logo and the menu slides in at the top and stays there (desktop; on phones the hamburger menu stays as it was).
- **Team:** Claire's quote now sits next to a cut-out photo of her that fades into the background (background removed from the placeholder photo, no AI image). The 3D ring has larger cards, a pause/play button between the arrows, and clicking the front card opens it as a large card with a short bio, Call / WhatsApp / Email buttons and a "Back to the team" button. The bios are placeholder text.
- **Questions (replaces Articles):** three tabs (Buying, Selling, Villages) with nine questions each. The first question is highlighted in orange. The last row fades out until "See all questions". Answers use only facts that are already on the site.
- **Thinking of selling:** "Plan a free valuation" and "Visit us" are two buttons without arrows. "Visit us" became "Visit address". An orange line under "Plan your route".
- **Map:** the grey blocks are now little houses with pitched roofs, like board-game houses, on a grid of fields. Meterik was missing and has been added (16 villages).
- **Footer:** "Visit" is now "Address", without opening hours. All texts and links are white, only the headings are orange. The intro text is replaced by a photo of the office entrance with the Larkline logo on the glass. This is a montage: the office photo with a drawn window frame and the logo as window lettering.

## Changes in Prototype v11

- **Team:** Claire's quote now stands above her cut-out photo; her name sits next to the photo.
- **Valuation form:** step 2 has a clear "Back" button (returns to step 1 with the answers kept) and a "Send my request" button. Before sending, a privacy checkbox must be ticked ("I agree that Larkline uses my details only to contact me about this valuation", with a link to the privacy policy). After sending, a thank-you screen shows the agent who will call, a summary of the home, phone and email, and a "Send another request" button. Design only: nothing is really sent, and the privacy link has no page yet.
- **Thinking of selling:** the orange line now separates this section from the footer (the line under "Plan your route" is gone).
- **Footer:** the bottom row (logo, social icons, small print) is a slim bar fixed to the bottom of the screen, with an orange line on top. On phones it shows only the logo and icons; the small print stays in the footer. The grey line is gone.
- **Map:** light grey streets: roads between neighbouring villages and a few streets in each village. The roads are illustrative, not the real road network.
- Add-on: footer bar social icons larger (1.75rem desktop, 1.5rem mobile) and spaced wider (40px desktop, 20px mobile). Only the last footer row is sticky.
- Add-on: "How can we help?" card links slightly larger (body-m strong) and the arrow points down, matching the pointed card shape.
- Add-on: "Homes we are selling right now" has a slightly darker warm beige background (#EAE0D3, token --homes-bg) so the light cards stand out; inactive carousel dots darkened to stay visible.
- Add-on: the village cards are now a slowly running band (loops endlessly, pauses on mouse hover or a tap; filters still work; no movement for people who turned off animations in their device settings).
- Add-on: on phones the "How can we help?" cards stand one per row.
- Add-on: on phones the to-top button hides while the valuation form is on screen, so it no longer covers form text.

## Changes in Prototype v12

- **Header:** back to the pre-v10 header: no sticky bar, no orange divider above the menu. The "New homes by WhatsApp" button is gone. New: a magnifier that opens a compact search field (design only: it jumps to the homes and fills in the street), and a language switch EN | NL. On phones the switch sits next to the menu button.
- **Language:** the whole site (home and property page, FAQ, forms, buttons, alt texts, footer) is available in Dutch. The switch works without reloading and remembers the choice. The Dutch text is a careful machine-quality translation by Claude; a native speaker should check it before going live.
- **Hero:** the sale board has a WhatsApp line with the green original logo. Under the hero buttons a small hint: "In North Limburg, the Netherlands, in the beautiful municipality of Horst aan de Maas".
- **Form:** going back from step 2 always works, also with empty fields: Back button, the first progress dot, or the browser's own back button.
- **Visit us map:** the village map now sits on a ball (a symbol for the earth). It turns gently into place, the names light up, then the camera flies to the office. Streets follow the grid of the houses, are wider and see-through. After the flight, pointing at (or tapping) a village lights it up and shows who to ask. Still an illustration, not a real map.
- **Footer bar:** taller (5rem) with a bigger logo; on phones the logo stays smaller so all icons fit.
- **Property page:** now loads script.js too (language switch, search, notch).

## Changes in Prototype v13

- **Hero:** the location hint is bigger (body-l) and stands above the buttons. The dark shade now reaches down under the text and only fades out just above the hedge.
- **Sale board:** mail, WhatsApp and phone icons all have the same size.
- **Menu:** "Contact" added; it jumps to the "Thinking of selling / Visit us" section (id="contact").
- **Globe:** starts with the whole earth, made of little field tiles and houses (continents from a built-in 1.5° land map from Natural Earth / world-atlas; Antarctica left out). The earth turns to Europe, "Europe" and "The Netherlands" light up, the Netherlands glow orange, and the camera dives down. A short dark fade leads into Horst aan de Maas as a tiny planet, which is now covered with fields and farms all the way round. Then as before: the names light up, the camera flies to the office, and pointing at a village shows who to ask. Illustration only, not a real map.

## Changes in Prototype v14

- **Hero:** the light no longer follows the mouse, and the soft light circle is gone too. The hero is calm: only the dark gradient under the text stays.
- **Hero hint:** the pin is bigger (2.5rem) and sends out a few soft orange rings after the page loads (none for people who turned off animations), with a short "See where we are →" underneath; the pin sits right after that arrow. Pin and text are one link that opens a popup: the globe turns from the earth to Europe, shows Amsterdam as a landmark everyone knows, and stops at Horst aan de Maas with every village lit; pointing at (or tapping) a village shows who to ask. No flight to the office here: that stays in "Visit us". Close with the × button, Esc or a click outside.
- **Visit us globe:** skips the earth intro now. It starts right above Horst aan de Maas and only flies to the office, so it is short.
- **Hero quote:** the sentence "We take on fewer clients…" now sits under "See where we are" and above the buttons, as a spoken quote: Newsreader italic, curly quote marks, an orange line on the left and the name "Claire Morgan, founder" under it. The attribution to Claire is an assumption for the prototype.
- **Popup globe:** Amsterdam is now soft blue (token --map-landmark), so it is clearly a landmark and not one of our places. The dive from Europe via Amsterdam to Horst is slower (5.6 s instead of 3.4 s). Amsterdam and Horst now have a dark pill behind the name so they stay readable over the orange tiles, and Amsterdam fades out as Horst appears.
- **Sale board:** the email address is now black (dark-1); the mail icon and the WhatsApp icon are logo orange (brand-1).
- **How can we help cards:** a thin orange border (token --card-border, 1.5px) that follows the pointed shape. It is made with drop-shadows on the list item, because clip-path would cut off a normal border.
- **Responsive check:** both pages tested at 1440, 768, 390 and 360 px wide: no sideways page scrolling. Only the village chips and the "similar homes" row scroll sideways on purpose.
- **Choose the village (replaces the running band):** a calm picker. On desktop the village names stand in a list on the left, each with its agent ("Ask Daniel"); one big photo with name, short text and agent is on the right. Clicking a name (or pointing at it with a mouse) changes the photo with a soft fade. On phones the photo comes first and the names are small buttons under it. The filter chips still work: they shorten the list, and the first village left is shown. Nothing moves on its own any more.
- **Village photos:** each village now has three photos, like the home cards: one big photo with the name, and three small ones under it. Clicking a small photo (or pointing at it with a mouse) shows it big. The extra photos are Unsplash placeholders chosen by mood (river, roses, market, heather, forest); none of them shows the real village.
- **Popup globe flight:** after the dive the camera first looks at Amsterdam, then the globe turns under a blue arrow that draws itself from Amsterdam to Horst (3.4 s), like a plane's route; then the villages appear. Honest limit: Amsterdam and Horst are only about 150 km apart, so on the earth globe the two points are close together and the arrow is a short, high arc.
- **Sale board:** mail and WhatsApp now use the same layout (icon left, text right), the same text size (token --sign-contact-size) and the same icon size (--sign-icon). The WhatsApp icon lost its round badge so both icons look equally big.
- **globe-popup.html:** the globe popup as one standalone file (HTML + CSS + JS, three.js r128 from cdnjs), to work on it separately.
- **Small on purpose:** the office photo is replaced by the team photo the client supplied (assets/larkline-team.jpg, 16:9). The card now overlaps the photo less (columns 8 to 12), so all five people stay visible. Caption: "The Larkline team at the office in Horst." Note: the photo looks AI-generated; for the live site a real team photo is better.
- **Team size:** Larkline is Claire and four agents, nobody else (Dana removed). About text: "Today it is Claire and four agents at the office in Horst." Fact line: "Four local agents, some looking after several villages."
- **visit-us-globe.html:** the Visit us globe (fly to the office) as one standalone file (HTML + CSS + JS, three.js r128 from cdnjs).
- **Sale board on phones:** mail and WhatsApp text are the same size; on phones the icon always sits above its text, and the board is a little taller (3:4.3) so everything fits. Mobile hero min-height 67rem.
- **Office address:** now "Gasthuisstraat 12, Horst" everywhere the office is named (Visit us, map card, footer, alt texts). The home for sale on Gasthuisstraat keeps the street without a number.
- **Reworked globe (from the client's improved files):** both globes now use the improved larklineGlobe code: a smooth continuous ground instead of loose tiles, lighter colours, taller houses, fewer houses outside the villages, lit village names in light text, a calmer fade between earth and region, smoother easing, timing based on real frame time (pauses when the tab is hidden), and a still end picture for people who turned off animations. The office card now says "Find us here".
- **Location panel under Visit us:** once the office card shows, a light panel opens with "Visit Larkline", the address, a "Plan your route" button (Google Maps directions) and an embedded Google map. Text in English with Dutch in the switch. The global "turn off all animations" rule from the client file was not copied, because the site already handles reduced motion per animation.
- **globe-popup.html / visit-us-globe.html:** replaced with the client's improved standalone files.
- **Map choice:** the old OpenStreetMap text link under the visit address is gone (it doubled the route button). The embedded map in the panel is now OpenStreetMap (no Google cookies or tracking, so no cookie consent needed for it); the "Plan your route" button still opens Google Maps directions, because most visitors use Google Maps for navigation and it only loads when they click.
- **Logo in "Visit Larkline":** the dark Larkline logo now sits above the "Visit Larkline" heading in the location panel (decorative, alt="" because the heading already says Larkline).
- **Quotes in handwriting:** all three quotes (hero quote, Claire's team quote, the sample review) use the handwriting font Caveat (token `--quote-font`, loaded from Google Fonts), set larger because handwriting runs small. Only quotes use it, never body text, so the site stays easy to read.
- **"Ask Daniel" opens the agent:** in the village picker, "Ask [agent]" is now its own small button with the agent's round face (in the list and on the photo caption). Clicking the village name picks the village; clicking the agent opens that agent's large card (same card as in the team ring: photo, villages, short bio, Call / WhatsApp / Email). On phones the list shows only village pills, so the agent button sits on the photo caption.
- **Agent button order:** "Ask Daniel →" then the round face at the far right, so all faces in the village list line up in one column.
