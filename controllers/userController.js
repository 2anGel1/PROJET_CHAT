const { PricingV2TrunkingCountryInstanceTerminatingPrefixPrices } = require("twilio/lib/rest/pricing/v2/voice/country.js")

const User = require("../lib/prisma.js").user

/* --------------------CRUD----------------------- */

exports.getAll = async (req, res) => {
    try {
        console.log("geting all users")
        const data = await User.findMany({
            select: {
                phone_number: true,
                firstname: true,
                lastname: true,
                status: true,
                id: true,
            }
        })

        console.log("Users")
        res.status(200).json({ status: true, data: data })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.updateUser = async (req, res) => {
    try {
        console.log("updating in user...");
        var user = await User.update({
            where: {
                id: req.params.user_id
            },
            data: {
                phone_number: req.body.phone_number,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
            }
        })

        user = await User.findFirst({
            where: {
                id: user.id
            },
            select: {
                phone_number: true,
                firstname: true,
                lastname: true,
                status: true
            }
        })

        console.log("Updated")
        res.status(200).json({ status: true, data: user })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        console.log("deleting in user...")
        await User.delete({
            where: {
                id: req.params.user_id
            }
        })

        console.log("Deleted")
        res.status(200).json({ status: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getOne = async (req, res) => {
    try {
        console.log("getting user...")

        const user = await User.findFirst({
            where: {
                id: req.body.user_id
            }
        })

        return {
            status: true,
            data: user
        };
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/* --------------------AUTH----------------------- */
exports.updateSession = async (req, res) => {
    try {
        if(req.body.action == "ONLINE")
            console.log("connecting user with id <<" + req.body.user_id + ">>")
        else
            console.log("disconnecting user with id <<" + req.body.user_id + ">>")

        await User.update({
            where: {
                id: req.body.user_id
            },
            data: {
                status: req.body.action
            }
        })
        return {
            status: true,
        };
    } catch (error) {
        return error.message;
    }
}

exports.login = async (req, res) => {
    try {
        console.log("logging in user...")
        // console.log(req.body)
        var user = await User.findFirst({
            where: {
                phone_number: req.body.phone_number
            }
        })
        if (user) {

            if (user.password != req.body.password) {
                console.log("passowrd issue")
                res.status(400).json({ error: 'Mot de passe incorrect' })
            }

            // change status
            await User.update({
                where: {
                    id: user.id
                },
                data: {
                    status: 'ONLINE'
                },
                select: {
                    phone_number: true,
                    firstname: true,
                    lastname: true
                }
            })


            user = await User.findFirst({
                where: {
                    id: user.id
                },
                select: {
                    phone_number: true,
                    firstname: true,
                    lastname: true,
                    id: true,
                }
            })

            console.log("Connected")
            res.status(200).json({ status: true, data: user })
        } else {
            res.status(401).json({ error: 'Numéro de téléphone incorrect' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.signup = async (req, res) => {
    try {
        console.log("signing up user...")
        // console.log(req.body)
        var user = await User.create({
            data: {
                phone_number: req.body.phone_number,
                firstname: req.body.firstname.toUpperCase(),
                lastname: req.body.lastname.toUpperCase(),
                password: req.body.password
            }
        })

        user = await User.findFirst({
            where: {
                id: user.id
            },
            select: {
                phone_number: true,
                firstname: true,
                lastname: true,
                id: true,
            }
        })

        console.log("Signed Up")
        res.status(201).json({ status: true, data: user })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message })
    }
}

exports.logout = async (req, res) => {
    try {
        console.log("logging out user")
        console.log(req.params.user_id)
        await User.update({
            where: {
                id: req.params.user_id,
            },
            data: {
                status: 'OFFLINE'
            }
        })

        console.log("Disconnected")
        res.status(200).json({ status: true})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

