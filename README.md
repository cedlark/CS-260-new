# TacoBaco

[My Notes](notes.md)

I am making a website that lets friends review different taco shops, where only their friends are able to see them. It will be in a social media style where you can post after a visit and it will stay with that specific store. As you visit shops the color of it changes, and if one of you friends visits a shop it also changes to a different color. This way you can see where you and your friends have been, get reviews you trust more, and make funny reviews using inside jokes.


## 🚀 Specification Deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

Are you sick of getting advice from strangers? Do you love tacos? The tacobaco website and application make it easy for friends to share experiences and reviews about tacos. It has an interactive map so you can see where your friends have been before and the reviews they left. It also has a feed so that everytime one of your friends goes somewhere you are able to see their review. This is a fun way to share opinions with your friends.

### Design

![Design image](design.jpg)


### Key features

- Main page with google maps embedded into it so you can see the taco shops around you.
- Friends page where you can see your friends recent reviews
- Page where you can add friends
- Page where you can review the restaurants

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - Structuring the main page and the other pages so that it is easily navigable.
- **CSS** - Styling and making the page look good
- **React** - Helps to move around the page, interact with other people, and find new friends.
- **Service** - Having the user profile and storing their friends and restaurants. There is a login, logout, and register page. As well it opens google maps so that you can see where the taco shops are on the maps.
- **DB/Login** - The account is stored along with all of their friends and reviews
- **WebSocket** - The reviews and friend requests that other people send that you then recieve

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name** - [My server link](https://yourdomainnamehere.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - Made 4 html pages
- [x] **Proper HTML element usage** - Used body and divs to seperate different parts
- [x] **Links** - Links to the other pages and to images
- [x] **Text** - Wrote text to show where things where
- [x] **3rd party API placeholder** - Put the google maps image in place of where the map will be
- [x] **Images** - Added multiple images
- [x] **Login placeholder** - Have a place to log in and create an account.
- [x] **DB data placeholder** - Have a place for your posts to be saved and your friends to be saved and come to you.
- [x] **WebSocket placeholder** - Have a place for your posts to be saved and your friends to be saved and come to you.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Header, footer, and main content body** - All files have Header, footer, and main content bodies
- [x] **Navigation elements** - Used multiple nav elements
- [x] **Responsive to window resizing** - I used flex options so that it sould disapear.
- [x] **Application elements** - I included many different css elements in the design
- [x] **Application text content** - I have text
- [x] **Application images** - PUt images where they need to be

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Bundled using Vite** - I downloaded vite and followed the instructions.
- [x] **Components** - I followed the simon example to have components in my work.
- [x] **Router** - I routed it up.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **All functionality implemented or mocked out** - Added funcitonality to the places that needed it
- [X] **Hooks** - Left Hooks where applicable

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Node.js/Express HTTP service** - I did it and ran it
- [X] **Static middleware for frontend** - Added static
- [X] **Calls to third party endpoints** - I called google maps
- [X] **Backend service endpoints** - Login endpoints
- [X] **Frontend calls service endpoints** - The login called it
- [X] **Supports registration, login, logout, and restricted endpoint** - I did this


## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Stores data in MongoDB** - The posts are in mongo
- [X] **Stores credentials in MongoDB** - Stores the username and password in Mongo

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Backend listens for WebSocket connection** - Stores the websocket
- [X] **Frontend makes WebSocket connection** -sends and recieves posts
- [X] **Data sent over WebSocket connection** - Posts are sent over
- [X] **WebSocket data displayed** - With the posts (You might need to make an account and put in posts)
- [X] **Application is fully functional** - All the main parts are there
