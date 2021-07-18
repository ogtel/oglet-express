const { User, validateUser } = require("../models/user")
const { Notification, validateNotification } = require("../models/notification")
const router = require("express").Router()
const ensureToken = require("../middleware/jwt")
const mongoose = require("mongoose");

router.post("/", ensureToken, async (req, res) => {
    try{
        const { error } = validateNotification(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const activeUser = await User.findOne({ _id: req.currentUser._id});
        req.body.owner = activeUser._id


        const notification = new Notification(req.body)
        // relationlar guncelleniyor
        activeUser.notifications.push(notification._id)
        activeUser.save()

        notification.save()
        res.send(notification);
    } catch (error) {
        console.log(error);
        res.send("An error occured");
    }


})

router.get("/", ensureToken, async (req, res) => {
    const userNotifications = await Notification.find({owner: req.currentUser._id}).populate("owner")
    res.json(userNotifications)
})

router.delete("/:notificationId", ensureToken, async (req, res) => {
    const { notificationId } = req.params
    const notification = await Notification.findOne({_id: notificationId})
    if(!notification) return res.status(400).send("notification not found");
    const activeUser = await User.findOne({ _id: req.currentUser._id});
    activeUser.notifications.remove(notification._id)
    activeUser.save()
    notification.delete()
    res.status(200).send("Notification deleted.")
})

router.put("/:notificationId", ensureToken, async (req, res) => {
    const { notificationId } = req.params
    const notification = await Notification.findOne({_id: notificationId})
    if(!notification) return res.status(400).send("notification not found");
    notification.isRead = req.body.isRead
    notification.save()
    res.status(200).send("Notification updated.")  
})

module.exports = router