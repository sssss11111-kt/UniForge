# Visual State Matrix

| Surface      | Loading            | Empty                   | Error             | Offline           | Approval               | Read-only          |
| ------------ | ------------------ | ----------------------- | ----------------- | ----------------- | ---------------------- | ------------------ |
| Dashboard    | skeleton           | onboarding guidance     | recoverable error | offline banner    | approval count         | preserved snapshot |
| Agent Center | run placeholder    | create task guidance    | failure evidence  | paused state      | approval queue         | replay only        |
| Course       | object skeleton    | import/create guidance  | import error      | local data notice | confirmation preview   | no mutation        |
| English      | study skeleton     | setup guidance          | data error        | local progress    | gated action           | review only        |
| Project      | workspace skeleton | create project guidance | tool/build error  | local workspace   | command approval       | inspect only       |
| Knowledge    | inbox skeleton     | capture guidance        | connector error   | local queue       | external-send approval | search only        |
| News         | feed skeleton      | source setup            | source error      | cached evidence   | connector approval     | cached read        |
