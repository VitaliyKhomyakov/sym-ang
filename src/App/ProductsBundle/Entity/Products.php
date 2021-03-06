<?php

namespace App\ProductsBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 *
 * @ORM\Entity(repositoryClass="App\ProductsBundle\Repository\ProductsRepository")
 */
class Products
{

    /*
     * Length of fields
     */
    const STR_LEM_MIN_TITLE       = 3;
    const STR_LEM_MAX_TITLE       = 30;
    const STR_LEN_MIN_DESCRIPTION = 30;
    const STR_LEN_MAX_DESCRIPTION = 250;

    /**
     * @var integer $id
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;


    /**
     * @ORM\OneToMany(targetEntity="ProductsPhoto", mappedBy="product_id", cascade={"all"}, orphanRemoval=true  )
     */
    private $photo;

    /**
     * @var string $title
     *
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @var text $description
     *
     * @ORM\Column(name="description", type="text")
     */
    private $description;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Products
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string 
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set description
     *
     * @param string $description
     * @return Products
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string 
     */
    public function getDescription()
    {
        return $this->description;
    }
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->photo = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add photo
     *
     * @param \App\ProductsBundle\Entity\ProductsPhoto $photo
     * @return Products
     */
    public function addPhoto(\App\ProductsBundle\Entity\ProductsPhoto $photo)
    {
        $this->photo[] = $photo;

        return $this;
    }

    /**
     * Remove photo
     *
     * @param \App\ProductsBundle\Entity\ProductsPhoto $photo
     */
    public function removePhoto(\App\ProductsBundle\Entity\ProductsPhoto $photo)
    {
        $this->photo->removeElement($photo);
    }

    /**
     * Get photo
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * Get first photo
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getFirstPhoto() {

        if (empty($this->photo[0])) {
            $this->photo = 'nofoto.png';
            return $this;
        }
        return $this->photo[0];
    }

}
