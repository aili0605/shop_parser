import db from "../models/index.cjs";
const { sequelize, Article, Topic, Comment } = db;

export async function insertNewTopic(topicName) {
    const [topic, created] = await Topic.findOrCreate({
        where: { name: topicName },
        defaults: { name: topicName }
    });
    return topic.id;
}


export async function insertNewArticle(
    title,
    content,
    topic_id,
    date,
    author,
) {
    const article = await Article.create({
        title: title,
        content: content,
        topic_id: topic_id,
        date: date,
        author: author
    });
    return article.id;
}

export async function insertNewComment(
    article_id,
    text,
    date,
    author
) {
    const comment = await Comment.create({
        article_id: article_id,
        text: text,
        date: date,
        author: author
    });
    return comment.id;
}
