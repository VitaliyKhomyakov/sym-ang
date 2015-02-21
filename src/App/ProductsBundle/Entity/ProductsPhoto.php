<?php

namespace App\ProductsBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 *
 * @ORM\Entity
 */
class ProductsPhoto
{
    /**
     * @var integer $photo_id
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="Products", inversedBy="photo")
     * @ORM\JoinColumn(name="product_id", referencedColumnName="id")
     */
    private $product_id;

    /**
     * @var string $photo
     *
     * @ORM\Column(name="photo", type="string", length=50)
     */
    private $photo;


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
     * Set photo
     *
     * @param string $photo
     * @return ProductsPhoto
     */
    public function setPhoto($photo)
    {
        $this->photo = $photo;

        return $this;
    }

    /**
     * Get photo
     *
     * @return string 
     */
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * Set product_id
     *
     * @param \App\ProductsBundle\Entity\Products $productId
     * @return ProductsPhoto
     */
    public function setProductId(\App\ProductsBundle\Entity\Products $productId = null)
    {
        $this->product_id = $productId;

        return $this;
    }

    /**
     * Get product_id
     *
     * @return \App\ProductsBundle\Entity\Products 
     */
    public function getProductId()
    {
        return $this->product_id;
    }
}
