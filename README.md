EnIndex
=======

Encrypted IndexedDB - Designed for convenience of use, using Promise instead
of callback or multiple callbacks for events.

Git Clone
=========

Repository
  * [https://github.com/desiic/enindex](https://github.com/desiic/enindex)

Coding Convention
=================

Similar to C++ STL with one exceptional rule for compound properties/variables.
  * my_namespace
  * my_class
  * my_method (or function var, or event)
  * my_primitive (maths is using both lower-case and upper-case, bool or number)
  * My_Compound (maths is using both lower-case and upper-case, others)
  * MY_CONSTANT

Database Convention
===================

Primary field `id` (auto-incremented) is always added by default to all object stores.
Special object stores such as `op_hist` (operation history), `fts` (full-text search)
are added to index schema by default when using those features too.

Documentation
=============

Usage
  * Use `eidb` class in global scope; see doc: [eidb](http://doc.desiic.com/enindex/module-eidb.html)
  
Quick Start and Guides
  * [https://coda.io/@desiic/enindex](https://coda.io/@desiic/enindex) (WIP!)

Source Code Documentation
  * [http://doc.desiic.com/enindex](http://doc.desiic.com/enindex)

Tools
  * JSDoc, clean-jsdoc-theme Template

Lib Fixes
=========

JSDoc: Error TypeError: Do not know how to serialize a BigInt
```
at JSON.stringify (<anonymous>)
at exports.nodeToValue (/usr/lib/node_modules/jsdoc/lib/jsdoc/src/astnode.js)
```
How to Fix:
  * Open `astnode.js` to edit
  * Add this line at top `BigInt.prototype.toJSON = function(){ return this.toString(); };`
  * Ref: https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-953187833

Dependencies
============

Generate/Encryption/Decryption
  * Web Crypto API

Generate/Sign/Verify
  * Elliptic
___