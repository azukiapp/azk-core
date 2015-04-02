# azk-core

`azk-core` has the main tools and frameworks to compose azk environment packages. It uses babel to transpile ES6/ES7 to ES5. To start new projects that follow azk standards, you can go with `azk-projects-boilerplate`

## utilities

- **Q**
  - Promises

- **lazy_require**
  - require only when was used

- **isBlank**
  - check if is

- **os**

- **version**

- **dlog**
  - call console.log(utils.inspect) with a title

- **Dynamic**
  - creates a simple object with a key to be used on config

- **_**
  - lodash

- **envDefaultArray**

- **envs**

- **path**
  - require('path')

- **fs**
  - require('fs')

- **async**
  - Q async class with steroids

- **defer**
  - Q defer class with steroids

- **Log**
  - Log Class

- **ConfigAzk**
  - ConfigAzk Class

- **NetUtils**
  - NetUtils Class

- **Utils**
  - Utils class

## npm dependencies

- [babel](https://github.com/babel/babel)
- [colors](https://github.com/Marak/colors.js)
- [crypto](https://github.com/Gozala/crypto)
- [lodash](https://github.com/lodash/lodash)
- [printf](https://github.com/wdavidw/node-printf)
- [q](https://www.npmjs.com/package/q)
- [source-map-support](https://github.com/evanw/node-source-map-support)

#### before start

```
$ npm install
```

#### test + lint (no watch)

```
$ gulp
```

#### test + lint + watch

```
$ gulp test
```

#### test + watch (no-lint)

```
$ gulp test-no-lint
```

#### publish a patch to npm

```
$ npm run-script patch
```
