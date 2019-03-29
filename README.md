# GitKraken Glo Boards for Alexa ![GitHub](https://img.shields.io/github/license/iamady/glo-boards-alexa.svg) 

## Development
```sh
git clone https://github.com/iamady/glo-boards-alexa.git
cd glo-boards-alexa/lambda/custom/
npm install
```
Pack index.js and node_modules together in a <YourZipFileName>.zip file
AWS CLI [Setup Tutorial](https://www.youtube.com/watch?v=abv_1PiM40w)
After Setup is complete run command below wih correct parameters.
```sh
aws lambda update-function-code --function-name <YourFunctionName> --zip-file fileb://./<YourZipFileName>.zip --publish
```

## Known Issues
* If you try list Tasks Due without creating a board, column or card you won't be able to fetch card created by you for the due date.

## Roadmap
- [x] List boards
- [x] Select boards
- [x] Create boards
- [x] Delete boards
- [x] Add cards
- [x] Delete card
- [x] Tasks Due for particular day/date
- [x] List Columns
- [x] Create Column
- [x] Delete Column
  - [ ] List Cards in Column _(Next Update)_
  - [ ] Manage Labels _(Next Update)_
  - [ ] Add Comment to a Card _(Next Update)_
  - [ ] Add Alexa Presentation Language Support _(Future Updates)_
  - [ ] Use Javascript @axosoft/glo-sdk _(Future Updates)_


## Support
You can email me at [me@adityashin.de](mailto:me@adityashin.de) or PM [@adityashin.de](https://instagram.com/adityashin.de) on Instagram.
