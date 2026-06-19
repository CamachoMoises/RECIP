# Tailwind CSS Migration Guide

## Current State Analysis

**Version**: `@material-tailwind/react` v2.1.10 (65 files using MT components)

**Tech Stack**:
- React 18 + TypeScript + Vite
- Tailwind CSS v4 (with v3 compatibility config)
- @material-tailwind/react v2.1.10
- lucide-react v0.452.0
- clsx v2.1.1
- tailwind-merge (transitive dep)

**Most Used Components**:
- `Button`, `Typography`, `Input`, `Dialog`, `Card`, `Menu`, `Select`, `Checkbox`, `Radio`, `Switch`, `List`, `ListItem`, `IconButton`, `Popover`, `Collapse`, `Spinner`, `Avatar`, `Chip`, `Tooltip`, `Tabs`, `Progress`, `Accordion`, `Breadcrumb`, `Pagination`

**Key Patterns**:
- All MT components use `placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}` (~200+ occurrences)
- `ThemeProvider` wraps entire app in `main.tsx`
- `tailwind.config.js` uses `withMT()` wrapper (v3 incompatible)
- Custom `cn()` utility already exists (shadcn-ready)
- `lucide-react` already installed
- `clsx` already installed

---

## Option 1: Migrate to @material-tailwind/react v3

### Breaking Changes (Comprehensive List)

#### **Configuration Changes**
1. **`withMT()` removed** → Replace with `mtConfig` plugin in `tailwind.config.js`
2. **`ThemeProvider` optional** → Can remove wrapper (unless custom theming needed)
3. **Framer Motion removed** → Components no longer animated by default (bundle size reduction)

#### **Prop Changes**
4. **`color` prop values changed**:
   - ❌ Old: `"white" | "black" | "blue-gray" | "gray" | "brown" | "deep-orange" | "orange" | "amber" | "yellow" | "lime" | "light-green" | "green" | "teal" | "cyan" | "light-blue" | "blue" | "indigo" | "deep-purple" | "purple" | "pink" | "red"`
   - ✅ New: `"primary" | "secondary" | "info" | "success" | "warning" | "error"`

5. **`variant` prop values changed**:
   - ❌ Old: `"filled" | "outlined" | "gradient" | "text"`
   - ✅ New: `"solid" | "outline" | "gradient" | "ghost"`

6. **`fullWidth` → `isFullWidth`** (all components)

7. **`placeholder`, `onPointerEnterCapture`, `onPointerLeaveCapture`** → No longer required (can remove ~200 occurrences)

#### **Component Removals**
8. **`<Carousel />`** → Use Swiper integration
9. **`<Navbar />`** → Use `<Card />` + `<Collapse />`
10. **`<SpeedDial />`** → Use `<Tooltip />` + `<IconButton />`
11. **`<Stepper />`** → Use `<Timeline />`

#### **Component API Rewrites** (Breaking)
12. **`<Accordion />`** → Compound component API:
    ```tsx
    // v2
    <Accordion open={open} onClick={toggle}>
      <AccordionHeader>Title</AccordionHeader>
      <AccordionBody>Content</AccordionBody>
    </Accordion>
    
    // v3
    <Accordion>
      <Accordion.Item>
        <Accordion.Trigger />
        <Accordion.Content />
      </Accordion.Item>
    </Accordion>
    ```

13. **`<Dialog />`** → Compound component API:
    ```tsx
    // v2
    <Dialog open={open} handler={handleOpen}>
      <DialogHeader>Title</DialogHeader>
      <DialogBody>Content</DialogBody>
      <DialogFooter>Actions</DialogFooter>
    </Dialog>
    
    // v3
    <Dialog>
      <Dialog.Trigger />
      <Dialog.Overlay>
        <Dialog.Content>
          <Dialog.DismissTrigger />
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog>
    ```

14. **`<Input />`** → Compound API, removed props:
    - ❌ Removed: `variant`, `label`, `labelProps`, `containerProps`, `shrink`, `error`, `success`
    - ✅ New: `isError`, `isSuccess`
    - Structure: `<Input><Input.Icon /></Input>`

15. **`<Select />`** → Native HTML select behavior:
    ```tsx
    // v3
    <Select>
      <Select.Trigger />
      <Select.List>
        <Select.Option />
      </Select.List>
    </Select>
    ```

16. **`<Menu />`** changes:
    - `handler` → `onOpenChange`
    - `<MenuHandler />` → `<MenuTrigger />`
    - `<MenuList />` → `<MenuContent />`
    - Removed: `dismiss`, `lockScroll`, `allowHover`

17. **`<Checkbox />`** → Compound API:
    ```tsx
    <Checkbox>
      <Checkbox.Indicator />
    </Checkbox>
    ```

18. **`<Radio />`** → Compound API:
    ```tsx
    <Radio>
      <Radio.Item>
        <Radio.Indicator />
      </Radio.Item>
    </Radio>
    ```

19. **`<Switch />`** → Removed props:
    - ❌ Removed: `label`, `ripple`, `containerProps`, `labelProps`, `circleProps`, `inputRef`
    - Use `<Typography />` for label

20. **`<Typography />`**:
    - `variant` → `type`
    - Removed: `textGradient`

21. **`<Button />`**:
    - Removed: `loading` prop

22. **`<Card />`**:
    - Removed: `shadow` prop

23. **`<Card.Header />`**:
    - Removed: `variant`, `color`, `shadow`, `floated`

24. **`<List.Item>`**:
    - `<ListItemPrefix />` → `<ListItemStart />`
    - `<ListItemSuffix />` → `<ListItemEnd />`

25. **`<Progress />`**:
    ```tsx
    <Progress>
      <Progress.Bar />
    </Progress>
    ```

26. **`<Tabs />`**:
    ```tsx
    <Tabs>
      <Tabs.List>
        <Tabs.Trigger />
        <Tabs.TriggerIndicator />
      </Tabs.List>
      <Tabs.Panel />
    </Tabs>
    ```

27. **`<Tooltip />`**:
    ```tsx
    <Tooltip>
      <Tooltip.Trigger />
      <Tooltip.Content>
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
    ```

28. **`<Timeline />`**:
    ```tsx
    <Timeline>
      <Timeline.Item>
        <Timeline.Header>
          <Timeline.Separator />
          <Timeline.Icon />
        </Timeline.Header>
        <Timeline.Body />
      </Timeline.Item>
    </Timeline>
    ```

29. **`<Alert />`**, **`<Chip />`**, **`<Drawer />`**, **`<Breadcrumb />`** (was `<Breadcrumbs />`)** → All rewritten with compound APIs

#### **Files Requiring Changes** (Estimated)
- **65 files** import MT components
- **~200 lines** with `placeholder`/`onPointer*` props to remove
- **NavBar.tsx**: Uses `Menu`, `Popover`, `Collapse`, `Button`, `MenuItem`, `MenuList`, `MenuHandler`
- **modalFormUser.tsx**: Uses `Dialog`, `Input`, `Select`, `Switch`, `Button`
- **generalConfig.tsx**: Uses `Accordion`, `Card`, `Button`, `Typography`
- **generalCourses.tsx**: Uses `Card`, `List`, `ListItem`, `Collapse`, `Button`
- **All test/assessment forms**: Heavy `Input`, `Radio`, `Checkbox`, `Button` usage

---

## Option 2: Replace with shadcn/ui

### Prerequisites to Install
```bash
npm install -D tailwindcss-animate
npm install class-variance-authority
```

### Configuration Changes
1. **Add path alias `@/`** to `tsconfig.app.json` and `vite.config.ts`
2. **Create `components.json`** for shadcn config
3. **Remove `@material-tailwind/react`** dependencies
4. **Remove `ThemeProvider`** from `main.tsx`
5. **Update `tailwind.config.js`** → Remove `withMT()`, use native Tailwind v4 config
6. **Create `src/components/ui/`** directory

### Components to Add (shadcn)
Based on current MT usage, need:
- `button`, `card`, `input`, `dialog`, `select`, `checkbox`, `radio-group`, `switch`, `popover`, `dropdown-menu`, `collapsible`, `accordion`, `breadcrumb`, `pagination`, `progress`, `tabs`, `tooltip`, `avatar`, `badge`, `toast` (already using react-hot-toast), `table`, `form`, `label`, `scroll-area`, `separator`

### Breaking Changes (Comprehensive List)

#### **API Differences**
1. **All component props change** → shadcn uses Radix UI primitives with different prop names
2. **No `color` prop** → Use Tailwind classes directly (`className="bg-blue-500"`)
3. **No `variant` prop standardization** → Each component defines its own variants via `class-variance-authority`
4. **No `size` prop standardization** → Each component defines sizes differently
5. **Form components** → shadcn uses `react-hook-form` + `zod` (already have react-hook-form)

#### **Specific Component Migrations**
6. **`<Dialog />`** → shadcn uses Radix `Dialog`:
    ```tsx
    // MT v2
    <Dialog open={open} handler={handleOpen}>
      <DialogHeader>Title</DialogHeader>
      <DialogBody>Content</DialogBody>
    </Dialog>
    
    // shadcn
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
        <DialogContent>Body</DialogContent>
      </DialogContent>
    </Dialog>
    ```

7. **`<Select />`** → Radix `Select`:
    ```tsx
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Option 1</SelectItem>
      </SelectContent>
    </Select>
    ```

8. **`<Input />`** → Simple input with className:
    ```tsx
    <Input className="" {...register('field')} />
    ```
    No more `placeholder={undefined}` props

9. **`<Menu />`** → `DropdownMenu`:
    ```tsx
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    ```

10. **`<Switch />`** → Radix Switch:
    ```tsx
    <Switch checked={checked} onCheckedChange={setChecked} />
    ```

11. **`<Checkbox />`** → Radix Checkbox:
    ```tsx
    <Checkbox checked={checked} onCheckedChange={setChecked} />
    ```

12. **`<Radio />`** → `RadioGroup`:
    ```tsx
    <RadioGroup value={value} onValueChange={setValue}>
      <RadioGroupItem value="1">Option 1</RadioGroupItem>
    </RadioGroup>
    ```

13. **`<Popover />`** → Radix Popover:
    ```tsx
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open</Button>
      </PopoverTrigger>
      <PopoverContent>Content</PopoverContent>
    </Popover>
    ```

14. **`<Collapse />`** → `Collapsible`:
    ```tsx
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger>Trigger</CollapsibleTrigger>
      <CollapsibleContent>Content</CollapsibleContent>
    </Collapsible>
    ```

15. **`<Accordion />`** → Radix Accordion:
    ```tsx
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Trigger</AccordionTrigger>
        <AccordionContent>Content</AccordionContent>
      </AccordionItem>
    </Accordion>
    ```

16. **`<Typography />`** → Remove entirely, use native HTML + Tailwind classes
17. **`<Card />`** → shadcn Card:
    ```tsx
    <Card>
      <CardHeader><CardTitle>Title</CardTitle></CardHeader>
      <CardContent>Content</CardContent>
    </Card>
    ```

18. **`<List />`, `<ListItem />`** → Use native `<ul>`, `<li>` or shadcn patterns
19. **`<IconButton />`** → `<Button variant="ghost" size="icon">`
20. **`<Spinner />`** → Custom component or Lucide `Loader2`
21. **`<Chip />`** → shadcn `Badge`
22. **`<Tooltip />`** → Radix Tooltip
23. **`<Progress />`** → Radix Progress
24. **`<Tabs />`** → Radix Tabs
25. **`<Breadcrumb />`** → Custom component (shadcn doesn't provide)
26. **`<Pagination />`** → Custom component
27. **`<Avatar />`** → Radix Avatar
28. **`<Option />`** → Removed, use native `<option>` or shadcn Select

#### **Files Requiring Full Rewrite**
- **ALL 65 files** with MT imports need changes
- **NavBar.tsx**: Complete rewrite (Menu, Popover, Collapse)
- **All modal forms**: Dialog, Input, Select rewrite
- **All test/assessment components**: Input, Radio, Checkbox, Button rewrite
- **PageTitle.tsx**: Typography replacement
- **LoadingPage.tsx**: Spinner replacement
- **ErrorPage.tsx**: Button, Typography replacement
- **HomePage.tsx, AboutUs.tsx**: Button replacement

#### **Additional Work**
29. **Custom CSS migration**: `src/index.css`, `src/styles/global.css` reference MT classes
30. **Theme system**: Current `useTheme()` hook uses CSS variables, need to ensure compatibility
31. **PDF components**: Some use MT `Typography` (CSA_PDF.tsx, pdfCourseSchedule.tsx, resultsTestPdf.tsx)

---

## Comparison Table

| Aspect | MT v2 → v3 | MT → shadcn/ui |
|--------|-----------|----------------|
| **Files to modify** | 65 | 65+ |
| **Lines to change** | ~400-500 | ~800-1000 |
| **Config changes** | tailwind.config.js, main.tsx | tsconfig, vite.config, tailwind.config, components.json, main.tsx |
| **New dependencies** | 0 | 10+ (Radix primitives, cva, tailwindcss-animate) |
| **Bundle size** | ↓ Smaller (no Framer Motion) | ↓↓ Smaller (tree-shakable) |
| **Customization** | Limited to MT theme | Full Tailwind control |
| **Learning curve** | Medium (new APIs) | High (Radix APIs + patterns) |
| **Long-term maintenance** | Dependent on MT updates | Full control, community standard |
| **Accessibility** | Good | Excellent (Radix primitives) |
| **Documentation** | MT docs | shadcn + Radix docs |
| **Theme compatibility** | Keep existing | Need to verify CSS variables work |

---

## Recommendation

**For this project**: Migrate to **@material-tailwind/react v3** IF:
- Want minimal changes (remove `placeholder` props, update config)
- Team familiar with MT patterns
- MT v3 components sufficient

**Choose shadcn/ui** IF:
- Want full Tailwind control and customization
- Prefer component ownership (copy-paste, modify source)
- Better accessibility is priority
- Willing to invest time in full rewrite
- Long-term project sustainability

**Estimated effort**:
- **MT v3**: 2-3 days (mostly find/replace + testing)
- **shadcn/ui**: 1-2 weeks (full rewrite + testing + design system decisions)

---

## Next Steps (Once Decision Made)

### For MT v3:
1. Update `@material-tailwind/react` to v3.0.0
2. Update `tailwind.config.js` to use `mtConfig` plugin
3. Remove `ThemeProvider` (optional)
4. Remove all `placeholder`, `onPointerEnterCapture`, `onPointerLeaveCapture` props
5. Update `color` and `variant` prop values
6. Rewrite compound components (Dialog, Input, Select, Menu, etc.)
7. Test all routes

### For shadcn/ui:
1. Initialize shadcn: `npx shadcn@latest init`
2. Configure path alias `@/`
3. Add all required components
4. Replace every MT component with shadcn equivalent
5. Update custom CSS
6. Test all routes

---

## Files Using @material-tailwind/react

Total: **65 files**

### High Usage Files (10+ MT components)
- `src/pages/dashboard/config/generalConfig.tsx`
- `src/pages/dashboard/config/courseDetail.tsx`
- `src/pages/dashboard/config/testList.tsx`
- `src/pages/dashboard/config/questionTestList.tsx`
- `src/pages/dashboard/courses/generalCourses.tsx`
- `src/pages/dashboard/courses/newCourseStudentSchedule.tsx`
- `src/pages/dashboard/courses/viewCourseStudentSchedule.tsx`
- `src/pages/dashboard/students/tableStudents.tsx`
- `src/pages/dashboard/instructors/tableInstructors.tsx`
- `src/pages/dashboard/users/usersTable.tsx`
- `src/pages/dashboard/users/modalFormUser.tsx`
- `src/pages/dashboard/assessment/generalAssessment.tsx`
- `src/pages/dashboard/assessment/detailAssessment.tsx`
- `src/pages/dashboard/assessment/newAssessment.tsx`
- `src/pages/dashboard/assessment/CSAD_form.tsx`
- `src/pages/dashboard/test/generalTest.tsx`
- `src/pages/dashboard/test/newTest.tsx`
- `src/pages/dashboard/test/reviewTest.tsx`

### Medium Usage Files (5-9 MT components)
- `src/components/NavBar.tsx`
- `src/components/PageTitle.tsx`
- `src/pages/dashboard/config/modalFormCourse.tsx`
- `src/pages/dashboard/config/modalFormSubject.tsx`
- `src/pages/dashboard/config/lessonDetail.tsx`
- `src/pages/dashboard/config/newTestModal.tsx`
- `src/pages/dashboard/config/newQuestionTest.tsx`
- `src/pages/dashboard/config/testParams.tsx`
- `src/pages/dashboard/courses/courseGroupsSection.tsx`
- `src/pages/dashboard/courses/modalFormCourseGroup.tsx`
- `src/pages/dashboard/courses/modalAssignStudents.tsx`
- `src/pages/dashboard/suggestions/SuggestionDialog.tsx`
- `src/pages/dashboard/suggestions/SuggestionListDialog.tsx`
- `src/pages/dashboard/test/components/ExamsModal.tsx`
- `src/pages/dashboard/test/components/TestListItemActions.tsx`

### Low Usage Files (1-4 MT components)
- `src/main.tsx`
- `src/components/LoadingPage.tsx`
- `src/components/ErrorPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/AboutUs.tsx`
- `src/pages/login.tsx`
- `src/pages/dashboard/icons.tsx`
- `src/pages/dashboard/config/questionType.tsx`
- `src/pages/dashboard/config/questionTest.tsx`
- `src/pages/dashboard/config/excelUploadComponent.tsx`
- `src/pages/dashboard/config/newAnswerQuestionTest.tsx`
- `src/pages/dashboard/config/questionTypeTest/Check.tsx`
- `src/pages/dashboard/config/questionTypeTest/Input.tsx`
- `src/pages/dashboard/config/questionTypeTest/Radio.tsx`
- `src/pages/dashboard/config/questionTypeTest/Completion.tsx`
- `src/pages/dashboard/config/questionTypeTest/components/questionHeader.tsx`
- `src/pages/dashboard/config/questionTypeTest/components/answerValue.tsx`
- `src/pages/dashboard/courses/pdfCourseSchedule.tsx`
- `src/pages/dashboard/courses/newCourseStudentScheduleSubject.tsx`
- `src/pages/dashboard/assessment/lessonDetails.tsx`
- `src/pages/dashboard/assessment/CSA_PDF.tsx`
- `src/pages/dashboard/assessment/scoreDetail.tsx`
- `src/pages/dashboard/test/questionTypeCheck.tsx`
- `src/pages/dashboard/test/questionTypeInput.tsx`
- `src/pages/dashboard/test/questionTypeRadio.tsx`
- `src/pages/dashboard/test/questionTypeCompletion.tsx`
- `src/pages/dashboard/test/resultsTestPdf.tsx`
- `src/pages/dashboard/test/reviewItemList.tsx`
- `src/pages/dashboard/test/components/TestListItem.tsx`
- `src/pages/dashboard/test/components/TestListPagination.tsx`
- `src/pages/dashboard/test/components/BypassMaxTriesSwitch.tsx`
- `src/pages/dashboard/reports/Reports.tsx`
- `src/features/counter/Counter.tsx`

---

## Component Usage Count

| Component | Approx. Usage |
|-----------|--------------|
| Button | 50+ |
| Typography | 40+ |
| Input | 35+ |
| Dialog | 20+ |
| Card | 20+ |
| Select | 15+ |
| Menu/MenuItem/MenuHandler/MenuList | 15+ |
| Checkbox | 12+ |
| Radio | 10+ |
| Switch | 10+ |
| List/ListItem | 10+ |
| IconButton | 10+ |
| Collapse | 8+ |
| Popover/PopoverHandler/PopoverContent | 8+ |
| Accordion/AccordionBody/AccordionHeader | 6+ |
| Tabs/Tab | 5+ |
| Progress | 4+ |
| Spinner | 4+ |
| Avatar | 3+ |
| Chip | 3+ |
| Tooltip | 3+ |
| Breadcrumb | 2+ |
| Pagination | 2+ |
| Option | 10+ |
| Textarea | 5+ |

---

## Important Notes

### Tailwind v3 vs v4 Conflict
The project has `tailwindcss` v4 and `@tailwindcss/postcss` v4 installed, but `tailwind.config.js` uses the old CommonJS format with `withMT()`. Tailwind v4 is designed to use CSS-based configuration (via `@theme` directives), not JS config files. The `@config` directive in `index.css` bridges this, but it is technically a v4 compatibility feature for v3 configs.

### Material Tailwind v2 requires Tailwind v3
`@material-tailwind/react` v2.1.10 was built against Tailwind CSS v3. The project is using Tailwind CSS v4 with a compatibility config layer. This may already be causing issues.

### ThemeProvider
`main.tsx` wraps the app in `<ThemeProvider>` from `@material-tailwind/react`. shadcn/ui does not use this provider.

### No path aliases
shadcn/ui by default generates components with `@/components/ui/...` imports. No `@/` alias exists in `tsconfig.app.json` or `vite.config.ts`.

### already has `cn()` utility
The `src/lib/utils.ts` file already follows the exact shadcn pattern with `clsx` + `twMerge`. However, `tailwind-merge` v1.8.1 (transitive from MT) is older; shadcn typically pairs with newer versions via direct dependency.

---

## Resources

- [Material Tailwind v3 Migration Guide](https://www.material-tailwind.com/docs/v3/react/migration/v3)
- [Material Tailwind v3 Documentation](https://www.material-tailwind.com/docs/v3/react/installation)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: June 19, 2026
**Project**: RECIP Frontend (Registro de Evaluación, Capacitación e Instrucción del Piloto)
