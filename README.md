# Accordion

This is one of a 2-part component:

* **Start of Accordion (this component)**
* [End of Accordion](https://github.com/Fliplet/fliplet-widget-accordion-end)

Accordions are created by arranging the **START** and **END** components.

To create an accordion with one collapsible section:

```
[START - Accordion Section]
Accordion content goes in between.
[END]
```

**Note: If an `[END]` component cannot be found the accordion will end at the end of the content container.**

To create an accordion with more than one collapsible section, add more **START** components to separate the content. This is ideal if you want to make sure only one collapsible section is opened in an accordion.

```
[START - Accordion Section 1]
Accordion content goes in between.
[START - Accordion Section 2]
Accordion content goes in between.
[START - Accordion Section 3]
Accordion content goes in between.
[END]
```

To create multiple independent collapsible sections that open and close separately, use more **END** components to separate the accordions.

```
[START - Accordion Section 1]
Accordion content goes in between.
[END]
[START - Accordion Section 2] // This one expands & collapses independently from the 1st accordion section
Accordion content goes in between.
[END]
```

## FAQ

* Can I nest accordions within accordions? **Not at the moment. We think the user experience would be quite poor and the content should be organized differently to avoid this situation.**