# Image Organizer
Thinkful unit 2 full-stack capstone project.

![Screenshot](https://github.com/amcavinue/image-organizer/blob/master/screenshots.jpg)

### Overview
I created this app because I needed a way to manage the collection of images I use for art and illustration projects. It was inspired by organizer and productivity apps like Evernote. Each project I do uses a different theme, and needs different images. The app implements a tag system, which allows the user to mine unrelated images for related qualities. This can be used as a source of inspiration, as a creativite tool, or can be used to locate reference for specific objects.

### Use Case
Why is this app useful? It allows you to organize lots of images that have personal significance to you, and search through them in a fluid, useable way not provided by typical filesystems.

### Live Prototype
The live site can be seen at: [https://still-temple-63836.herokuapp.com/](https://still-temple-63836.herokuapp.com/)

### Functionality
 - Implements a tag system that can be used on multiple images, updated, and added to in real-time.
 - Works as a SPA, allowing the user to upload images, change tags, and change images without reloading the browser.
 - Has a filter system allowing the user to search based on tags, filenames, or words in the image descriptions.
 - Has easy drag-and-drop functionality for uploading images.
 - Implemented with clean design principles.

### Data Modeling
The tag system for this project required a many-to-many relationship between the different collections of data. This was visualized before building the application with this image:
![Data Model](https://github.com/amcavinue/image-organizer/blob/master/image_tags_schema_1.jpg)

### Technical
- The app is built mainly with Node.js and MongoDB on the back end, and Bootstrap and jQuery on the front end. Helper libraries were used as well.
- The back end implements a full REST API, for creating images and tags, reading data and images, uploading images, modifying data, and deleting images, tags, and data.
- The entire API has been tested using Mocha, and the production version passes all tests.
- The front end is fully responsive and follows clean usability principles.
- Continuous integration using Travis CI was used during development.
- Heroku (server hosting), Cloud9 (editing), and mLab (MongoDB hosting) were SaaS services used during development and deployment.

### Development Roadmap
This is version 1.0.0 of the app. There are things that can be changed in the future that I'd like to do:
 - ##### Front End
    - Scalability modules:
        - Pagination
        - Lazy Loading
        - Refactor data processing with high time complexity.
- ##### Back End
    - Logic for resizing uploaded images.
