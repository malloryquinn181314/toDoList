// ----------------------- IMPORTING MODULES---------------------

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

// ================================= GLOBAL VARIABLES ==================================

const app = express();
const port = process.env.PORT || 3000;

// -------------------------------------- MIDDLEWARES =================================

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
mongoose.set("strictQuery", false);


// -----------------------DATABASE CONNECTIONS, SCHEMA, AND MODELS -----------------

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`DB connected to : ${conn.connection.host}`);
    }catch (err){
        console.log(err);
        process.exit(1);
    }
}

const listSchema = new mongoose.Schema({
    task: String
});

const workList = mongoose.model("workList", listSchema);

const listItemsArray = [
    {
        task: "Learn OOPS"
    },
    {
        task: "Create the dynamic routing parameters"
    },
    {
        task: "move forward with hasing and salting and encryption"
    }
];


const customListSchema = new mongoose.Schema({
    name: String,
    items: [listSchema]
})

const customList = mongoose.model("customList", customListSchema);





// =========================== ROUTE HANDLERS ===========================================

app.get("/", async (req, res) => {

    const taskList = await workList.find().exec();


    res.render("workList.ejs", { taskList });
})



app.get("/:listName", async (req, res) => {

    const listName = _.capitalize(req.params.listName);

    const taskList = await workList.find().exec();


    const listCheck = await customList.find({ name: listName }).exec();


    if (listCheck.length === 0) {

        const listItem = new customList({
            name: listName,
            items: taskList
        })

        listItem.save();
        res.redirect(`/${listName}`);

    } else {

        res.render("workList.ejs", { listName: listCheck[0].name, taskList: listCheck[0].items });
    }

});

app.post("/workList", async (req, res) => {

    const userListName = req.body.listName;

    const userTask = new workList({
        task: req.body.List
    });


    const foundList = await customList.findOne({ name: userListName });

    foundList.items.push(userTask);
    foundList.save();
    res.redirect(`/${userListName}`)

})

app.post("/delete", async (req, res) => {
    const toBeDeltedId = req.body.strikethrough;
    const toBeDeltedList = req.body.deletedListItem;
    

    await customList.findOne({name : toBeDeltedList}).then((foundList) => {
        foundList.items.pull({_id : toBeDeltedId});
        foundList.save();
        res.redirect(`/${toBeDeltedList}`);
    }).catch(function(err){
        console.log(err);
    })

})


connnectDB().then(() => {
    app.listen(port, () => {
        console.log(`server listening to port ${port}`);
    })
})