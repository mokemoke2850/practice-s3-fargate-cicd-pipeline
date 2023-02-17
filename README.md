# practice-s3-fargate-cicd-pipeline

S3 + Fargate の CICD Pipeline を構築する練習

## メモ

### ECR 構築とともにイメージをプッシュ

aws cdk 公式には標記の機能は存在しない。ただし、[cdklabs/cdk-docker-image-deployment](https://github.com/cdklabs/cdk-docker-image-deployment)を使用すれば実現可能。

[参考記事](https://zenn.dev/5t111111/articles/use-cdk-docker-image-deployment)

ECR にイメージが 1 つでも存在すると、リポジトリの削除に失敗する。現状では強制削除はできない模様。

aws cli を利用してイメージを削除してあげるしかなさそう...
