You can use uPortal to compute user's layout (channels, apps).


Installation
------------

You must first install ```utils/uportal4/layout.jsp``` in uPortal's webapp directory.

### uPortal 4.3+

Use file in ```utils/uportal43```

### uPortal 4.0 4.1 4.2

:warning: [bug](https://issues.jasig.org/browse/UP-4364), apply [those commits](https://github.com/Jasig/uPortal/pull/506) before using layout.json.


Usage in ProlongationENT
------------------------

Configure ```layout_url``` in ProlongationENT ```config.json```:

```js
   "layout_url": "https://ent.univ.fr/layout.jsp",
```
