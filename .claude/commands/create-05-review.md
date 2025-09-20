---
description: Review and optimize existing implementation against original plan and requirements
---

# Code Review

Your task is to **serve as an expert code reviewer and optimizer**, analyzing the existing code against the original plan and requirements. Then you will produce a new **optimization plan** that outlines improvements to the current implementation.

---

## **Task Overview**

1. **Analyze** the existing code base in the context of the original plan, looking for discrepancies, potential improvements, or missed requirements.
2. **Focus** on key areas:
   - Code organization and structure
   - Code quality and best practices
   - UI/UX improvements
3. **Wrap** this analysis in `<analysis>` tags to capture your insights.
4. **Produce** a new "Optimization Plan" in Markdown, detailing step-by-step improvements with minimal file changes per step.

Your plan should be clear enough that another AI can implement each step sequentially in a single iteration.

---

## **Detailed Process Outline**

1. **Review Inputs**
   - Ingest project request, rules, technical specification, implementation plan, and existing code.
2. **Perform Analysis**
   - Within `<analysis>` tags, comment on:
     1. **Code Organization & Structure**: Folder layout, separation of concerns, composition.
     2. **Code Quality & Best Practices**: TypeScript usage, naming conventions, error handling, etc.
     3. **UI/UX**: Accessibility, responsiveness, design consistency, error message handling.
3. **Generate Optimization Plan**
   - Use markdown formatting with the output template.
   - Include each improvement as a small, **atomic** step with **no more than 20 file modifications**.
   - Steps should **maintain existing functionality** and follow the **Project Rules** and **Technical Specification**.
4. **Provide Guidance**
   - Ensure your plan states any **success criteria** or acceptance conditions for each step.
   - End your plan with a **logical next step** if needed.

---

## **Output Template**

Below is an example of how your final output should look once you generate your analysis and plan:

```markdown
<analysis>
Here is my detailed review of the current codebase:
1. Code Organization: Observations, suggestions...
2. Code Quality: Observations, improvements...
3. UI/UX: Observations, improvements...
</analysis>

# Optimization Plan

## Code Structure & Organization
- [ ] Step 1: [Brief title]
  - **Task**: [Explanation]
  - **Files**:
    - `path/to/file1.ts`: [Description of changes]
    - ...
  - **Step Dependencies**: [None or references]
  - **User Instructions**: [Manual steps if any]

[Additional categories and steps...]
```

---

Please provide the implementation plan, technical specification, and existing code you'd like me to review and optimize.