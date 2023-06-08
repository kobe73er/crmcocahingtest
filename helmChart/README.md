## How to deploy
```shell
- cd /Users/andrew/Desktop/content/client/crmcoaching/crm-coach/code/app/nestjs_template_project/helmChart
- helm upgrade --install nestjd-demo-chart ./ --values ./values.yaml --recreate-pods --namespace backend
```
