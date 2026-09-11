# Git Workflow

## Branches

```text
main
  ↑
dev
  ├── intelligence
  ├── backend
  ├── frontend
  └── bank-dashboard
```

## Rules

### Start work
```bash
git checkout dev
git pull origin dev
git checkout <your-branch>
git merge dev
```

### Commit
Use:
```text
feat: add financial health service
fix: correct decision confidence
docs: update API contract
test: add anomaly cases
refactor: simplify decision policy
```

### Push
```bash
git push origin <your-branch>
```

### Integration
Create a PR:
`<your-branch> -> dev`

Do not merge directly into `main` unless the integrated `dev` build is tested.

## Contract changes
If changing an API/schema:
1. update docs
2. update JSON schema
3. notify all affected branches
4. add/update tests
5. then implement

## Avoid
- force push
- committing `.env`
- committing generated secrets
- changing another module's contract silently
- duplicate business logic
