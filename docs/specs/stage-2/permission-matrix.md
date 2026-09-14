# Stage 2 Permission Matrix

Date: 2026-09-06
Status: Draft pending review

| Capability | Read scope | Write scope | Approval |
|---|---|---|---|
| Exam Space | selected user profile | create/update own exam space | no, unless external sync |
| Vocabulary | selected user profile | domain commands for shared entries/state | no for local learning events |
| Import vocabulary | authorized file/workspace | propose entries and relations | required before durable bulk write |
| AI exercise generation | selected exam/vocabulary context | create AI Generated proposal | required before publishing durable content |
| FSRS scheduling | local vocabulary state | write derived review projection | domain service only |
| Mock exam | selected exam space | create instance and local results | no for local result entry |
| AI evaluation | submitted mock result | create evaluation proposal | required before publishing evaluation |
| External transmission | minimum selected payload | connector/tool gateway only | always required |
| Model/provider change | selected run/course/module scope | settings command | required if sensitive data leaves device |

Temporary grants expire with the task. Denied permissions fail visibly. API keys remain in OS secure credential storage.
